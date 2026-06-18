import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

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
            content: z.unknown()
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            if (!input.content) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid input"
                })
            }

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