import protectedProcedure from "~/server/trpc/protectedProcedure";

export default protectedProcedure.query(async ({ ctx }) => {
  return ctx.db.document.findMany({
    where: {
      userId: ctx.session.user.id,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });
});
