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
        }))
        .mutation(async ({ input }) => {
            const response =
                await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are a writing assistant inside a minimalist writing app.
Help the user with their document based on their instruction.
Rules:
- Only modify content if explicitly asked to.
- If asked a question, answer it directly.
- If asked to generate content, generate only what was requested.
- If asked for feedback or suggestions, give them without rewriting anything.
- Match the user's tone and style.`
                        },
                        {
                            role: "user",
                            content:
                                `Document Context: ${input.fullDocument}
                              Instruction: ${input.instruction}

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