import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  docIdSchema,
  titleSchema,
  editorContentSchema,
  hasSameDocumentSnapshot,
  createDocumentNotFoundError,
  createDocumentConflictError,
  z,
} from "~/server/documents/support";

export default protectedProcedure
  .input(
    z.object({
      docId: docIdSchema,
      title: titleSchema,
      content: editorContentSchema,
      version: z.number().int().nonnegative(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const existingDocument = await ctx.db.document.findFirst({
      where: {
        id: input.docId,
        userId: ctx.session.user.id,
        deletedAt: null,
      },
      select: {
        title: true,
        content: true,
        updatedAt: true,
        version: true,
      },
    });

    if (!existingDocument) {
      throw createDocumentNotFoundError();
    }

    if (hasSameDocumentSnapshot(existingDocument, input)) {
      return {
        title: existingDocument.title,
        updatedAt: existingDocument.updatedAt,
        version: existingDocument.version,
      };
    }

    if (existingDocument.version !== input.version) {
      throw createDocumentConflictError();
    }

    const updatedDocuments = await ctx.db.document.updateManyAndReturn({
      where: {
        id: input.docId,
        userId: ctx.session.user.id,
        deletedAt: null,
        version: input.version,
      },
      data: {
        title: input.title,
        content: input.content,
        version: {
          increment: 1,
        },
      },
      select: {
        title: true,
        updatedAt: true,
        version: true,
      },
    });

    // If the document version matched, the update succeeds and returns one document.
    const updatedDocument = updatedDocuments[0];

    if (updatedDocument) {
      return updatedDocument;
    }

    const latestDocument = await ctx.db.document.findFirst({
      where: {
        id: input.docId,
        userId: ctx.session.user.id,
        deletedAt: null,
      },
      select: {
        title: true,
        content: true,
        updatedAt: true,
        version: true,
      },
    });

    if (!latestDocument) {
      throw createDocumentNotFoundError();
    }

    if (hasSameDocumentSnapshot(latestDocument, input)) {
      return {
        title: latestDocument.title,
        updatedAt: latestDocument.updatedAt,
        version: latestDocument.version,
      };
    }

    throw createDocumentConflictError();
  });
