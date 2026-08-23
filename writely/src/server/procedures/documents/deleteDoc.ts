import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  docIdSchema,
  createDocumentNotFoundError,
  z,
} from "~/server/documents/support";

export default protectedProcedure
  .input(z.object({ docId: docIdSchema }))
  .mutation(async ({ ctx, input }) => {
    const result = await ctx.db.document.deleteMany({
      where: {
        id: input.docId,
        userId: ctx.session.user.id,
        deletedAt: null,
      },
    });

    if (result.count === 0) {
      throw createDocumentNotFoundError();
    }

    return { success: true };
  });
