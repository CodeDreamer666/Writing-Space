import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure
} from "~/server/api/trpc";

const jsonSchema: z.ZodType<any> = z.lazy(() =>
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

            const count = await ctx.db.document.count({
                where: {
                    userId
                }
            });

            if (count >= 100) throw new TRPCError({
                code: "FORBIDDEN",
                message: "Document limit reached"
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
                    updatedAt: "desc"
                }
            });

            return docs;
        }),

    getSelectedDoc: publicProcedure
        .input(z.object({
            docId: z.string().nonempty()
        }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.session?.user.id;

            const doc = await ctx.db.document.findUnique({
                where: { id: input.docId, userId }
            });

            if (!doc) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
            }

            return doc;
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

            await ctx.db.document.update({
                where: {
                    userId,
                    id: input.docId
                },
                data: {
                    title: input.title,
                    content: input.content
                },
            });

            return {
                success: true
            }
        })
})