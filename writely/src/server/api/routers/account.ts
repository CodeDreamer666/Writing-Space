import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const user = await ctx.db.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found"
            })
        }

        await ctx.db.user.delete({
            where: {
                id: userId
            }
        });

        return {
            success: true
        }
    })
});
