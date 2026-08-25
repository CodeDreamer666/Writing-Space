import protectedProcedure from "~/server/trpc/protectedProcedure";
import { TRPCError, z } from "~/server/feedback/support";

export default protectedProcedure
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
    const userId = ctx.session.user.id;

    return ctx.db.$transaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${"feedback-submit:" + userId}, 0)
        )::text`;

      const recentFeedback = await transaction.feedback.findFirst({
        where: {
          userId,
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

      await transaction.feedback.create({
        data: {
          userId,
          message: input.message,
        },
      });

      return { success: true };
    });
  });
