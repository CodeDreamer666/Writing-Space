import type { JSONContent } from "@tiptap/core";
import protectedProcedure from "~/server/trpc/protectedProcedure";
import {
  docIdSchema,
  editorContentSchema,
  createDocumentNotFoundError,
  TRPCError,
  z,
  exportDocumentContent,
  exportPdfDocument,
  exportRichDocument,
} from "~/server/documents/support";

export default protectedProcedure
  .input(
    z.object({
      docId: docIdSchema,
      format: z.enum(["txt", "md", "docx", "pdf"]),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const document = await ctx.db.document.findFirst({
      where: {
        id: input.docId,
        userId: ctx.session.user.id,
        deletedAt: null,
      },
      select: {
        title: true,
        content: true,
      },
    });

    if (!document) {
      throw createDocumentNotFoundError();
    }

    const parsedContent = editorContentSchema.safeParse(document.content);

    if (!parsedContent.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "This document could not be exported. Please try again.",
      });
    }

    const content = parsedContent.data as JSONContent;

    if (input.format === "txt" || input.format === "md") {
      return {
        title: document.title,
        content: exportDocumentContent(content, input.format),
        encoding: "utf8" as const,
        format: input.format,
        mimeType:
          input.format === "md"
            ? "text/markdown;charset=utf-8"
            : "text/plain;charset=utf-8",
      };
    }

    const exportedFile =
      input.format === "pdf"
        ? await exportPdfDocument(content, document.title)
        : await exportRichDocument(content, document.title);

    return {
      title: document.title,
      content: exportedFile.toString("base64"),
      encoding: "base64" as const,
      format: input.format,
      mimeType:
        input.format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  });
