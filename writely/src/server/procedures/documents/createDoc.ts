import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  createInitialDocumentContent,
  TRPCError,
  z,
  MAX_DOCUMENTS_PER_USER,
  MAX_INITIAL_DRAFT_CHARACTERS,
  containsUnsupportedPictographs,
  UNSUPPORTED_PICTOGRAPH_MESSAGE,
} from "~/server/documents/support";

export default protectedProcedure
  .input(
    z
      .object({
        initialText: z
          .string()
          .max(
            MAX_INITIAL_DRAFT_CHARACTERS,
            `A starting passage can contain up to ${MAX_INITIAL_DRAFT_CHARACTERS.toLocaleString()} characters.`,
          )
          .refine(
            (text) => !containsUnsupportedPictographs(text),
            UNSUPPORTED_PICTOGRAPH_MESSAGE,
          )
          .optional(),
      })
      .optional(),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    return ctx.db.$transaction(async (transaction) => {
      // Prevent the same user from creating documents at the exact same time and avoid race condition
      await transaction.$queryRaw`
               SELECT pg_advisory_xact_lock(
                   hashtextextended(${"document-create:" + userId}, 0)
               )::text`;

      const count = await transaction.document.count({
        where: {
          userId,
          deletedAt: null,
        },
      });

      // MAX_DOCUMENTS_PER_USER = 20
      if (count >= MAX_DOCUMENTS_PER_USER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You can keep up to ${MAX_DOCUMENTS_PER_USER} documents. Delete one before creating another.`,
        });
      }

      const user = await transaction.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          writingModePreference: true,
        },
      });

      return transaction.document.create({
        data: {
          userId,
          content: createInitialDocumentContent(input?.initialText),
          writingMode: user?.writingModePreference ?? "Clear",
        },
      });
    });
  });
