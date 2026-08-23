import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  getUtcUsageDate,
  env,
  DAILY_AI_TOKEN_LIMIT,
} from "~/server/ai/support";

export default protectedProcedure.query(async ({ ctx }) => {
  const enabled = env.AI_ENABLED === "true";

  const usage = await ctx.db.aiDailyUsage.findUnique({
    where: {
      userId_usageDate: {
        userId: ctx.session.user.id,
        usageDate: getUtcUsageDate(),
      },
    },
    select: {
      tokensUsed: true,
    },
  });

  const remainingTokens = Math.max(
    0,
    DAILY_AI_TOKEN_LIMIT - (usage?.tokensUsed ?? 0),
  );

  return {
    enabled,
    remainingTokens,
    message: enabled
      ? "Writely AI is ready."
      : "Writely AI is temporarily unavailable. You can keep writing and saving normally.",
  };
});
