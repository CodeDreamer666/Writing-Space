import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  docIdSchema,
  createDocumentNotFoundError,
  z,
  WRITING_MODES,
} from "~/server/documents/support";

export default protectedProcedure
  .input(
    z.object({
      docId: docIdSchema,
      writingMode: z.enum(WRITING_MODES),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    await ctx.db.$transaction(async (transaction) => {
      const document = await transaction.document.findFirst({
        where: {
          id: input.docId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!document) {
        throw createDocumentNotFoundError();
      }

      await transaction.document.updateMany({
        where: {
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        data: {
          writingMode: input.writingMode,
        },
      });

      await transaction.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          writingModePreference: input.writingMode,
        },
      });
    });

    return { writingMode: input.writingMode };
  });
