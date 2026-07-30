import { TRPCError } from "@trpc/server";
import Groq from "groq-sdk";
import type { ChatCompletion } from "groq-sdk/resources/chat/completions";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "~/env";
import {
  AI_FALLBACK_OUTPUT_TOKEN_LIMIT,
  DAILY_AI_TOKEN_LIMIT,
  MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import {
  containsUnsupportedPictographs,
  UNSUPPORTED_PICTOGRAPH_MESSAGE,
} from "~/lib/writingLanguage";
import {
  buildAiSystemMessage,
  getAiActionInstruction,
  getAiRetryInstruction,
} from "~/server/ai/prompts";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { AI_ACTIONS } from "~/types/ai";
import { WRITING_MODES } from "~/types/writing";

const AI_REQUEST_TIMEOUT_MS = 45_000;
const AI_REQUEST_LEASE_MS = 120_000;
const AI_MESSAGE_TOKEN_OVERHEAD = 32;
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

function getUtcUsageDate(now = new Date()) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function hasThreeOrFourSentences(value: string) {
  const sentences = value.trim().match(/[^.!?。！？]+[.!?。！？]+/gu);

  return sentences !== null && sentences.length >= 3 && sentences.length <= 4;
}

const rewriteResponseSchema = z.object({
  improved: z.string().trim().min(1),
  changes: z
    .string()
    .trim()
    .min(1)
    .refine(
      hasThreeOrFourSentences,
      "The rewrite explanation must contain 3 or 4 sentences.",
    ),
});

const anyHtmlTagPattern = /<[^>]*>/g;
const blockHtmlTagPattern =
  /<\s*\/?\s*(?:p|h[1-6]|ul|ol|li|blockquote|br)\b[^>]*>/gi;
const allowedRichTextTagPattern =
  /^<\s*(\/?)\s*(p|h[1-3]|ul|ol|li|strong|em|br)\s*\/?\s*>$/i;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeRichText(value: string): string {
  let sanitized = "";
  let lastIndex = 0;

  for (const tag of value.matchAll(anyHtmlTagPattern)) {
    const index = tag.index ?? 0;
    sanitized += escapeHtml(value.slice(lastIndex, index));

    const allowedTag = allowedRichTextTagPattern.exec(tag[0]);

    if (allowedTag) {
      const isClosingTag = allowedTag[1] === "/";
      const tagName = allowedTag[2]?.toLowerCase();

      if (tagName === "br") {
        sanitized += "<br>";
      } else if (tagName) {
        sanitized += `<${isClosingTag ? "/" : ""}${tagName}>`;
      }
    }

    lastIndex = index + tag[0].length;
  }

  return sanitized + escapeHtml(value.slice(lastIndex));
}

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi,
    (entity, decimal: string, hexadecimal: string, named: string) => {
      if (decimal) {
        return String.fromCodePoint(Number.parseInt(decimal, 10));
      }

      if (hexadecimal) {
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      }

      return namedEntities[named.toLowerCase()] ?? entity;
    },
  );
}

function normalizeWhitespace(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

function normalizePlainText(value: string): string {
  return normalizeWhitespace(value);
}

function normalizeRichText(value: string): string {
  const textContent = value
    .replaceAll(blockHtmlTagPattern, " ")
    .replaceAll(anyHtmlTagPattern, "");

  return normalizeWhitespace(decodeHtmlEntities(textContent));
}

function hasRichTextContent(value: string): boolean {
  return normalizeRichText(value).length > 0;
}

function parseRewriteResponse(
  content: string | null,
): z.infer<typeof rewriteResponseSchema> | null {
  if (!content?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    const result = rewriteResponseSchema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    const improved = sanitizeRichText(result.data.improved);

    return hasRichTextContent(improved) &&
      !containsUnsupportedPictographs(normalizeRichText(improved))
      ? { ...result.data, improved }
      : null;
  } catch {
    return null;
  }
}

function readUsableCompletion(completion: ChatCompletion) {
  const choice = completion.choices[0];
  const promptTokens = completion.usage?.prompt_tokens;
  const completionTokens = completion.usage?.completion_tokens;

  if (
    choice?.finish_reason !== "stop" ||
    !Number.isInteger(promptTokens) ||
    !Number.isInteger(completionTokens) ||
    promptTokens === undefined ||
    completionTokens === undefined ||
    promptTokens < 0 ||
    completionTokens < 0 ||
    promptTokens + completionTokens <= 0
  ) {
    return null;
  }

  return {
    content: choice.message.content ?? null,
    tokensUsed: promptTokens + completionTokens,
  };
}

function getInputTokenUpperBound(systemMessage: string, userMessage: string) {
  const messageBytes = new TextEncoder().encode(
    `${systemMessage}\n${userMessage}`,
  ).length;

  return Math.ceil(messageBytes / 4) + AI_MESSAGE_TOKEN_OVERHEAD;
}

function ensureAiEnabled() {
  if (env.AI_ENABLED !== "true") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Writely AI is temporarily unavailable. You can keep writing and saving normally.",
    });
  }
}

export const aiRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const enabled = env.AI_ENABLED === "true";

    const usage = await ctx.db.aiDailyUsage.findUnique({
      where: {
        userId_usageDate: {
          userId: ctx.session.user.id,
          usageDate: getUtcUsageDate(),
        },
      },
      select: {
        tokensUsed: true,
      },
    });

    const remainingTokens = Math.max(
      0,
      DAILY_AI_TOKEN_LIMIT - (usage?.tokensUsed ?? 0),
    );

    return {
      enabled,
      remainingTokens,
      message: enabled
        ? "Writely AI is ready."
        : "Writely AI is temporarily unavailable. You can keep writing and saving normally.",
    };
  }),

  askAi: protectedProcedure
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
          message:
            "This document is unavailable or belongs to another account.",
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
            OR: [
              { requestId: null },
              { requestExpiresAt: { lte: new Date() } },
            ],
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
              model: "llama-3.3-70b-versatile",
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
            message:
              "Writely AI returned an invalid response. Please try again.",
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

        const response = {
          content: usableCompletion.content,
          rewrite,
          tokensUsed: updatedTokensUsed,
        };
        const remainingTokens = Math.max(
          0,
          DAILY_AI_TOKEN_LIMIT - response.tokensUsed,
        );

        if (!response.rewrite) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Writely AI returned an invalid response. Please try again.",
          });
        }

        return {
          type: "rewrite" as const,
          original: input.selectedText,
          ...response.rewrite,
          remainingTokens,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("AI request failed.");
        }

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
          } catch {
            if (process.env.NODE_ENV === "development") {
              console.error("AI request lease cleanup failed.");
            }
          }
        }
      }
    }),
});
