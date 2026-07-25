import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const feedbackRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        message: z
          .string()
          .trim()
          .min(10, "Please share at least a few words.")
          .max(2_000, "Feedback can contain up to 2,000 characters."),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const recentFeedback = await ctx.db.feedback.findFirst({
        where: {
          userId: ctx.session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 60_000),
          },
        },
        select: {
          id: true,
        },
      });

      if (recentFeedback) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Your feedback was just received. Please wait before sending more.",
        });
      }

      await ctx.db.feedback.create({
        data: {
          userId: ctx.session.user.id,
          message: input.message,
        },
      });

      return { success: true };
    }),
});
