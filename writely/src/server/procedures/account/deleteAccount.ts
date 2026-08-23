import protectedProcedure from "~/server/trpc/protectedProcedure";
import { TRPCError } from "~/server/account/support";

export default protectedProcedure.mutation(async ({ ctx }) => {
  const userId = ctx.session.user.id;

  const user = await ctx.db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  await ctx.db.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    success: true,
  };
});
