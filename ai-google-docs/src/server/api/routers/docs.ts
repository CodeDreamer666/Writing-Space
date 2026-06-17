import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

const jsonSchema: z.ZodType<unknown> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(jsonSchema),
        z.record(z.string(), jsonSchema),
    ])
);

export const docsRouter = createTRPCRouter({
    createDocs: protectedProcedure
        .mutation(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const docs = await ctx.db.document.create({
                data: {
                    userId
                }
            });


            return {
                ...docs,
                content: !docs.content ? "" : docs.content
            }
        }),

    getUserDocs: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const docs = await ctx.db.document.findMany({
                where: {
                    userId
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            return docs;
        }),

    getSelectedDoc: protectedProcedure
        .input(z.object({
            docId: z.string().nonempty()
        }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            return await ctx.db.document.findUnique({
                where: {
                    id: input.docId,
                    userId
                }
            })
        }),

    deleteDoc: protectedProcedure
        .input(z.object({ docId: z.string().nonempty() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            await ctx.db.document.delete({
                where: {
                    id: input.docId,
                    userId
                }
            });

            return {
                success: true
            }
        }),

    renameDocTitle: protectedProcedure
        .input(z.object({
            docId: z.string().nonempty(),
            title: z.string().nonempty()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            await ctx.db.document.update({
                where: {
                    userId,
                    id: input.docId
                },
                data: {
                    title: input.title
                }
            });

            return {
                success: true
            }
        }),

    saveDoc: protectedProcedure
        .input(z.object({
            docId: z.string().nonempty(),
            title: z.string().nonempty(),
            content: jsonSchema
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            console.log("Title", input.title);
            console.log("Content", input.content)

            await ctx.db.document.update({
                where: {
                    userId,
                    id: input.docId
                },
                data: {
                    title: input.title,
                    content: input.content ?? undefined
                },
            });

            return {
                success: true
            }
        })
})