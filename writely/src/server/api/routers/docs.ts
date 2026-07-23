import { TRPCError } from "@trpc/server";
import type { JSONContent } from "@tiptap/core";
import { z } from "zod";
import {
  countDocumentCharacters,
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
  MAX_DOCUMENT_TITLE_LENGTH,
} from "~/lib/documentLimits";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  exportDocumentContent,
  isDocumentEmpty,
} from "~/server/documents/exportDocument";
import { exportRichDocument } from "~/server/documents/exportRichDocument";
import type { JsonInputValue } from "~/types/json";
import { WRITING_MODES } from "~/types/writing";

export const MAX_DOCUMENT_BYTES = 1_000_000;
export const MAX_TITLE_LENGTH = MAX_DOCUMENT_TITLE_LENGTH;

const docIdSchema = z.string().uuid();
const titleSchema = z.string().trim().min(1).max(MAX_TITLE_LENGTH);

const jsonValueSchema: z.ZodType<JsonInputValue | null> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const jsonSchema: z.ZodType<JsonInputValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

function containsUnsafeUrl(value: JsonInputValue | null): boolean {
  if (Array.isArray(value)) {
    return value.some(containsUnsafeUrl);
  }

  if (typeof value !== "object" || value === null) {
    return false;
  }

  const href =
    "attrs" in value &&
    typeof value.attrs === "object" &&
    value.attrs !== null &&
    !Array.isArray(value.attrs) &&
    "href" in value.attrs
      ? value.attrs.href
      : undefined;

  if (
    typeof href === "string" &&
    /^\s*(?:data|javascript|vbscript):/i.test(href)
  ) {
    return true;
  }

  return Object.values(value).some((child) =>
    child === undefined ? false : containsUnsafeUrl(child),
  );
}

export const editorContentSchema = jsonSchema
  .refine(
    (content) =>
      typeof content === "object" &&
      content !== null &&
      "type" in content &&
      content.type === "doc",
    "Invalid editor content",
  )
  .refine((content) => !containsUnsafeUrl(content), "Unsafe URL in document")
  .refine(
    (content) =>
      countDocumentCharacters(content as JSONContent) <=
      MAX_DOCUMENT_CHARACTERS,
    `A document can contain up to ${MAX_DOCUMENT_CHARACTERS.toLocaleString()} characters.`,
  )
  .refine(
    (content) =>
      new TextEncoder().encode(JSON.stringify(content)).length <=
      MAX_DOCUMENT_BYTES,
    `Document content must be ${MAX_DOCUMENT_BYTES} bytes or less`,
  );

const emptyDocumentContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const docsRouter = createTRPCRouter({
  createDoc: protectedProcedure.mutation(async ({ ctx }) => {
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

      return transaction.document.create({
        data: {
          userId,
          content: emptyDocumentContent,
        },
      });
    });
  }),

  getUserDocs: protectedProcedure.query(async ({ ctx }) => {
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
  }),

  getDeletedDocs: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.document.findMany({
      where: {
        userId: ctx.session.user.id,
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        title: true,
        deletedAt: true,
      },
    });
  }),

  getSelectedDoc: protectedProcedure
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      return document;
    }),

  deleteDoc: protectedProcedure
    .input(z.object({ docId: docIdSchema }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.document.updateMany({
        where: {
          id: input.docId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      return { success: true };
    }),

  restoreDoc: protectedProcedure
    .input(z.object({ docId: docIdSchema }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.$transaction(async (transaction) => {
        await transaction.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtextextended(${"document-create:" + userId}, 0)
          )::text`;

        const activeDocumentCount = await transaction.document.count({
          where: {
            userId,
            deletedAt: null,
          },
        });

        if (activeDocumentCount >= MAX_DOCUMENTS_PER_USER) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You can keep up to ${MAX_DOCUMENTS_PER_USER} documents. Delete one before restoring this draft.`,
          });
        }

        const result = await transaction.document.updateMany({
          where: {
            id: input.docId,
            userId,
            deletedAt: {
              not: null,
            },
          },
          data: {
            deletedAt: null,
          },
        });

        if (result.count === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "This document is unavailable or belongs to another account.",
          });
        }

        return { success: true };
      });
    }),

  updateWritingMode: protectedProcedure
    .input(
      z.object({
        docId: docIdSchema,
        writingMode: z.enum(WRITING_MODES),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.document.updateMany({
        where: {
          id: input.docId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        data: {
          writingMode: input.writingMode,
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      return { writingMode: input.writingMode };
    }),

  saveDoc: protectedProcedure
    .input(
      z.object({
        docId: docIdSchema,
        title: titleSchema,
        content: editorContentSchema,
        version: z.number().int().nonnegative(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      const existingDocument = await ctx.db.document.findFirst({
        where: {
          id: input.docId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!existingDocument) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      throw new TRPCError({
        code: "CONFLICT",
        message:
          "A newer saved version exists. Your recovered writing is still safe in this browser.",
      });
    }),

  exportDoc: protectedProcedure
    .input(
      z.object({
        docId: docIdSchema,
        format: z.enum(["txt", "md", "pdf", "docx"]),
      }),
    )
    .query(async ({ input, ctx }) => {
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      const parsedContent = editorContentSchema.safeParse(document.content);

      if (!parsedContent.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "This document could not be exported. Please try again.",
        });
      }

      const content = parsedContent.data as JSONContent;

      if (isDocumentEmpty(content)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Add some writing before exporting this document.",
        });
      }

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

      const exportedFile = await exportRichDocument(
        content,
        document.title,
        input.format,
      );

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
    }),
});
