import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { JsonInputValue } from "~/types/json";
import { WRITING_MODES } from "~/types/writing";

export const MAX_DOCUMENT_BYTES = 1_000_000;
export const MAX_TITLE_LENGTH = 200;

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
    const count = await ctx.db.document.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (count >= 100) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Document limit reached",
      });
    }

    return ctx.db.document.create({
      data: {
        userId,
        content: emptyDocumentContent,
      },
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
          message: "Document not found",
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
          message: "Document not found",
        });
      }

      return { success: true };
    }),

  renameDocTitle: protectedProcedure
    .input(
      z.object({
        docId: docIdSchema,
        title: titleSchema,
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
          title: input.title,
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
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
          message: "Document not found",
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
          message: "Document not found",
        });
      }

      throw new TRPCError({
        code: "CONFLICT",
        message: "This draft was updated elsewhere",
      });
    }),
});
