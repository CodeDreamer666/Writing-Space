import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  docIdSchema,
  createDocumentNotFoundError,
  z,
} from "~/server/documents/support";

export default protectedProcedure
  .input(z.object({ docId: docIdSchema }))
  .query(async ({ input, ctx }) => {
    const document = await ctx.db.document.findFirst({
      where: {
        id: input.docId,
        userId: ctx.session.user.id,
        deletedAt: null,
      },
    });

    if (!document) {
      throw createDocumentNotFoundError();
    }

    return document;
  });
