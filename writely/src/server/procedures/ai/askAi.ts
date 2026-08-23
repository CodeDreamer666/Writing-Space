import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
    AI_REQUEST_TIMEOUT_MS,
    AI_REQUEST_LEASE_MS,
    groq,
    getUtcUsageDate,
    sanitizeRichText,
    normalizePlainText,
    normalizeRichText,
    hasRichTextContent,
    parseRewriteResponse,
    readUsableCompletion,
    getInputTokenUpperBound,
    ensureAiEnabled,
    TRPCError,
    randomUUID,
    z,
    AI_FALLBACK_OUTPUT_TOKEN_LIMIT,
    DAILY_AI_TOKEN_LIMIT,
    MAX_AI_SELECTION_CHARACTERS,
    containsUnsupportedPictographs,
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
    buildAiSystemMessage,
    getAiActionInstruction,
    getAiRetryInstruction,
    AI_ACTIONS,
    WRITING_MODES,
} from "~/server/ai/support";

export default protectedProcedure
    .input(
        z
            .object({
                docId: z.string().uuid(),
                action: z.enum(AI_ACTIONS),
                mode: z.enum(WRITING_MODES),
                selectedText: z
                    .string()
                    .trim()
                    .min(1, "Select some text before using Writely AI.")
                    .max(
                        MAX_AI_SELECTION_CHARACTERS,
                        `AI selections can contain up to ${MAX_AI_SELECTION_CHARACTERS.toLocaleString()} characters.`,
                    )
                    .refine(
                        (text) => !containsUnsupportedPictographs(text),
                        UNSUPPORTED_PICTOGRAPH_MESSAGE,
                    ),
                selectedHtml: z
                    .string()
                    .trim()
                    .min(1)
                    .max(MAX_AI_SELECTION_CHARACTERS * 4),
            })
            .superRefine((input, validationContext) => {
                if (
                    normalizePlainText(input.selectedText) !==
                    normalizeRichText(input.selectedHtml)
                ) {
                    validationContext.addIssue({
                        code: "custom",
                        path: ["selectedHtml"],
                        message: "The selected text and formatting do not match.",
                    });
                }
            }),
    )
    .mutation(async ({ input, ctx }) => {
        ensureAiEnabled();

        const userId = ctx.session.user.id;
        const usageDate = getUtcUsageDate();
        const ownedDocument = await ctx.db.document.findFirst({
            where: {
                id: input.docId,
                userId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!ownedDocument) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "This document is unavailable or belongs to another account.",
            });
        }

        const instruction = getAiActionInstruction(input.action);
        const safeSelectedHtml = sanitizeRichText(input.selectedHtml);

        if (!hasRichTextContent(safeSelectedHtml)) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Select some text before using Writely AI.",
            });
        }

        const systemMessage = buildAiSystemMessage(input.mode);
        const userMessage = `<target>\n${safeSelectedHtml}\n</target>\n\nInstruction: ${instruction}`;

        const requestId = randomUUID();

        let leaseAcquired = false;

        try {
            await ctx.db.aiDailyUsage.upsert({
                where: {
                    userId_usageDate: {
                        userId,
                        usageDate,
                    },
                },
                create: {
                    userId,
                    usageDate,
                    tokensUsed: 0,
                },
                update: {},
            });

            const leaseResult = await ctx.db.aiDailyUsage.updateMany({
                where: {
                    userId,
                    usageDate,
                    OR: [{ requestId: null }, { requestExpiresAt: { lte: new Date() } }],
                },
                data: {
                    requestId,
                    requestExpiresAt: new Date(Date.now() + AI_REQUEST_LEASE_MS),
                },
            });

            if (leaseResult.count === 0) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message:
                        "An AI request is already running. Wait for it to finish before trying again.",
                });
            }

            leaseAcquired = true;

            const usage = await ctx.db.aiDailyUsage.findUnique({
                where: {
                    userId_usageDate: {
                        userId,
                        usageDate,
                    },
                },
                select: {
                    tokensUsed: true,
                },
            });

            const tokensUsed = usage?.tokensUsed ?? 0;
            const remainingTokensBeforeRequest = DAILY_AI_TOKEN_LIMIT - tokensUsed;

            if (remainingTokensBeforeRequest <= 0) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message:
                        "You have used today’s AI allowance. It resets automatically tomorrow.",
                });
            }

            const createCompletion = async (message: string) => {
                const outputTokenLimit = Math.min(
                    AI_FALLBACK_OUTPUT_TOKEN_LIMIT,
                    remainingTokensBeforeRequest -
                    getInputTokenUpperBound(systemMessage, message),
                );

                if (outputTokenLimit <= 0) {
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message:
                            "This selection is too large for today’s remaining AI allowance.",
                    });
                }

                return groq.chat.completions.create(
                    {
                        messages: [
                            {
                                role: "system",
                                content: systemMessage,
                            },
                            {
                                role: "user",
                                content: message,
                            },
                        ],
                        model: "qwen/qwen3.6-27b",
                        max_tokens: outputTokenLimit,
                    },
                    {
                        timeout: AI_REQUEST_TIMEOUT_MS,
                    },
                );
            };

            let completion = await createCompletion(userMessage);
            let usableCompletion = readUsableCompletion(completion);
            let rewrite = parseRewriteResponse(usableCompletion?.content ?? null);

            console.log("Completion ", completion);
            console.log("Usable Completion ", usableCompletion);
            console.log("Rewrite ", rewrite);

            if (!usableCompletion || !rewrite) {
                const retryMessage = `${userMessage}\n\n${getAiRetryInstruction()}`;
                completion = await createCompletion(retryMessage);
                usableCompletion = readUsableCompletion(completion);
                rewrite = parseRewriteResponse(usableCompletion?.content ?? null);
            }

            if (!usableCompletion) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        "Writely AI returned an unusable response. Please try again.",
                });
            }

            if (!rewrite) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Writely AI returned an invalid response. Please try again.",
                });
            }

            if (usableCompletion.tokensUsed > remainingTokensBeforeRequest) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message:
                        "This response would exceed today’s AI allowance. Try a shorter selection.",
                });
            }

            const updatedTokensUsed = await ctx.db.$transaction(
                async (transaction) => {
                    const currentUsage = await transaction.aiDailyUsage.findUnique({
                        where: {
                            userId_usageDate: {
                                userId,
                                usageDate,
                            },
                        },
                        select: {
                            requestId: true,
                            tokensUsed: true,
                        },
                    });

                    if (currentUsage?.requestId !== requestId) {
                        throw new TRPCError({
                            code: "TOO_MANY_REQUESTS",
                            message: "This AI request took too long. Please try it again.",
                        });
                    }

                    if (
                        currentUsage.tokensUsed + usableCompletion.tokensUsed >
                        DAILY_AI_TOKEN_LIMIT
                    ) {
                        throw new TRPCError({
                            code: "TOO_MANY_REQUESTS",
                            message:
                                "This response would exceed today’s AI allowance. Try a shorter selection.",
                        });
                    }

                    await transaction.aiDailyUsage.update({
                        where: {
                            userId_usageDate: {
                                userId,
                                usageDate,
                            },
                        },
                        data: {
                            tokensUsed: {
                                increment: usableCompletion.tokensUsed,
                            },
                            requestId: null,
                            requestExpiresAt: null,
                        },
                    });

                    return currentUsage.tokensUsed + usableCompletion.tokensUsed;
                },
            );

            const remainingTokens = Math.max(
                0,
                DAILY_AI_TOKEN_LIMIT - updatedTokensUsed,
            );

            return {
                type: "rewrite" as const,
                original: input.selectedText,
                ...rewrite,
                remainingTokens,
            };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }

            console.error("AI request failed:", error);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message:
                    "Writely AI could not complete that request. Please try again.",
            });
        } finally {
            if (leaseAcquired) {
                try {
                    await ctx.db.aiDailyUsage.updateMany({
                        where: {
                            userId,
                            usageDate,
                            requestId,
                        },
                        data: {
                            requestId: null,
                            requestExpiresAt: null,
                        },
                    });
                } catch (cleanupError) {
                    console.error("AI request lease cleanup failed:", cleanupError);
                }
            }
        }
    });
