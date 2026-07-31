import { TRPCError } from "@trpc/server";
import type { JSONContent } from "@tiptap/core";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  countDocumentCharacters,
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
  MAX_DOCUMENT_TITLE_LENGTH,
  MAX_INITIAL_DRAFT_CHARACTERS,
} from "~/lib/documentLimits";
import {
  containsUnsupportedPictographs,
  documentContainsUnsupportedPictographs,
  UNSUPPORTED_PICTOGRAPH_MESSAGE,
} from "~/lib/writingLanguage";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { exportDocumentContent } from "~/server/documents/exportDocument";
import { exportPdfDocument } from "~/server/documents/exportPdfDocument";
import { exportRichDocument } from "~/server/documents/exportRichDocument";
import { WRITING_MODES } from "~/types/writing";

type JsonInputObject = {
  readonly [key: string]: JsonInputValue | null | undefined;
};

type JsonInputArray = readonly (JsonInputValue | null)[];

type JsonInputValue =
  | string
  | number
  | boolean
  | JsonInputObject
  | JsonInputArray;

const MAX_DOCUMENT_BYTES = 1_000_000;
export const MAX_TITLE_LENGTH = MAX_DOCUMENT_TITLE_LENGTH;

const docIdSchema = z.string().uuid();
const titleSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_TITLE_LENGTH)
  .refine(
    (title) => !containsUnsupportedPictographs(title),
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
  );

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

const editorContentSchema = jsonSchema
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
      !documentContainsUnsupportedPictographs(content as JSONContent),
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
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

function createInitialDocumentContent(initialText: string | undefined) {
  if (!initialText) {
    return emptyDocumentContent;
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: initialText }],
      },
    ],
  };
}

function hasSameDocumentSnapshot(
  document: { title: string; content: unknown },
  input: { title: string; content: JsonInputValue },
) {
  return (
    document.title === input.title &&
    isDeepStrictEqual(document.content, input.content)
  );
}

export const docsRouter = createTRPCRouter({
  createDoc: protectedProcedure
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
      const result = await ctx.db.document.deleteMany({
        where: {
          id: input.docId,
          userId: ctx.session.user.id,
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
    }),

  updateWritingMode: protectedProcedure
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
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "This document is unavailable or belongs to another account.",
          });
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      if (hasSameDocumentSnapshot(existingDocument, input)) {
        return {
          title: existingDocument.title,
          updatedAt: existingDocument.updatedAt,
          version: existingDocument.version,
        };
      }

      if (existingDocument.version !== input.version) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "A newer saved version exists. Your recovered writing is still safe in this browser.",
        });
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This document is unavailable or belongs to another account.",
        });
      }

      if (hasSameDocumentSnapshot(latestDocument, input)) {
        return {
          title: latestDocument.title,
          updatedAt: latestDocument.updatedAt,
          version: latestDocument.version,
        };
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
        format: z.enum(["txt", "md", "docx", "pdf"]),
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
    }),
});
