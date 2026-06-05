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
        })
})