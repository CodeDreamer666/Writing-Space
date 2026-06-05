import { z } from "zod";
import { groq } from "~/server/grok";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const aiRouter = createTRPCRouter({
    askAi: protectedProcedure
        .input(z.object({
            instruction: z.string().nonempty(),
            fullDocument: z.string().nonempty(),
            selectedText: z.string().nonempty().optional()
        }))
        .mutation(async ({ input }) => {
            const response =
                await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `
                              You are an AI assistant integrated into a writing application.
                              Your purpose is to help users work with their writing.
                              Follow the user's instructions accurately.
                              Use the provided document context when it is relevant.
                              Preserve the user's intent, meaning, tone, and structure unless the user explicitly requests changes.
                              Do not make unnecessary modifications.
                              When editing text, focus on the requested change and avoid altering unrelated content.
                              When answering questions, provide clear, accurate, and well-structured responses.
                              Adapt to the user's goals, writing style, and context.
                            `
                        },
                        {
                            role: "user",
                            content: input.selectedText ? 
                            `Document Context: ${input.fullDocument}
                             Selected Text: ${input.selectedText}
                             Instruction: ${input.instruction}

                             Apply the instruction to the selected text.
                             Use the document context to understand tone, style, and surrounding content.
                             Preserve the original meaning unless the instruction explicitly requests otherwise.` : 
                             
                             `Document Context: ${input.fullDocument}
                              Instruction: ${input.instruction}

                              No text is currently selected.
                              Use the document context only when it is relevant to the instruction.
                              Do not rewrite, modify, or replace any document content unless the instruction explicitly asks for it.
                              If the instruction is a question, answer the question.
                              If the instruction requests new content, generate the requested content.
                              If the instruction requests analysis, feedback, or suggestions, provide them without altering the document.`
                        },
                    ],
                    model: "openai/gpt-oss-20b",
                });

            return response.choices[0]?.message.content;
        })
})