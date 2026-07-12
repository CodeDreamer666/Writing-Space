import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { groq } from "~/server/grok";
import { AI_ACTIONS } from "~/types/ai";
import { WRITING_MODES } from "~/types/writing";

const rewriteActionSchema = z.enum([
    "improveClarity",
    "fixGrammar",
    "makeNatural",
    "makeStronger",
]);

const rewriteResponseSchema = z.object({
    improved: z.string().min(1),
    changes: z.array(z.string().min(1)).min(1).max(5),
});

const actionInstructions = {
    improveClarity:
        "Rewrite the target so it is clearer and easier to understand. Preserve its meaning.",
    fixGrammar:
        "Correct grammar, spelling, and punctuation in the target without changing its meaning or voice.",
    makeNatural:
        "Rewrite the target so it sounds natural and human while preserving its meaning.",
    makeStronger:
        "Rewrite the target with stronger, more confident language while preserving its core meaning.",
    findWeakPoints:
        "Identify the weakest points in the target. Explain what is unclear, unconvincing, repetitive, or unsupported. Do not rewrite it.",
    suggestDirections:
        "Suggest useful directions for developing or improving the target. Give concise, actionable ideas and do not rewrite it.",
} as const;

export const aiRouter = createTRPCRouter({
    askAi: protectedProcedure
        .input(
            z.object({
                action: z.enum(AI_ACTIONS),
                mode: z.enum(WRITING_MODES),
                scope: z.enum(["selection", "document"]),
                selectedText: z.string().min(1).max(50000).optional(),
                fullDocument: z.string().min(1).max(50000),
                instruction: z.string().min(1).max(2000).optional(),
            })
                .superRefine((input, ctx) => {
                    if (input.scope === "selection" && !input.selectedText) {
                        ctx.addIssue({
                            code: "custom",
                            path: ["selectedText"],
                            message: "Selected text is required for selection scope.",
                        });
                    }

                    if (input.action === "custom" && !input.instruction) {
                        ctx.addIssue({
                            code: "custom",
                            path: ["instruction"],
                            message: "An instruction is required for a custom action.",
                        });
                    }
                }),
        )
        .mutation(async ({ input }) => {
            try {
                const target =
                    input.scope === "selection"
                        ? input.selectedText!
                        : input.fullDocument;
                const instruction =
                    input.action === "custom"
                        ? input.instruction!
                        : actionInstructions[input.action];

                const isRewrite = rewriteActionSchema.safeParse(input.action).success;

                const response = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `
                                 You are Writely AI, a writing assistant inside a minimalist writing app.
                                 Follow the supplied instruction exactly.
                                 Preserve the writer's intent and voice unless the instruction asks for a tone change.
                                 The user's selected writing mode is ${input.mode}.
                                 Apply that mode where it fits the requested action. For grammar fixes, preserve the writer's voice.
                                ${isRewrite
                                    ? `
                                       Return only valid JSON using exactly this structure:

                                       {
                                         "improved": "the rewritten text",
                                         "changes": [
                                                  "a concise description of one change"
                                                ]
                                        }

                                       Requirements:
                                           - Use the exact key "improved". Do not use "improved_text".
                                           - "improved" must be a string.
                                           - "changes" must be an array of 1 to 5 strings.
                                           - Every item in "changes" must be plain text, not an object.
                                           - Do not include fields such as "type" or "description".
                                           - Do not include Markdown, code fences, or text outside the JSON object.
                                      `
                                    : "Return only the requested response as plain text."
                                }`,
                        },
                        {
                            role: "user",
                            content: `<full_document>
                                      ${input.fullDocument}
                                      </full_document>

                                      <target scope="${input.scope}">
                                      ${target}
                                      </target>

                                      Instruction: ${instruction}`,
                        },
                    ],
                    model: "llama-3.1-8b-instant",
                    ...(isRewrite
                        ? { response_format: { type: "json_object" as const } }
                        : {}),
                });

                const content = response.choices[0]?.message.content;

                if (!content?.trim()) {
                    throw new Error("Empty response");
                }

                if (isRewrite) {
                    const rewrite = rewriteResponseSchema.parse(JSON.parse(content));

                    return {
                        type: "rewrite" as const,
                        original: target,
                        ...rewrite,
                    };
                }

                return {
                    type: "response" as const,
                    content: content.trim(),
                };
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "AI is unavailable. Please try again.",
                });
            }
        }),
});
