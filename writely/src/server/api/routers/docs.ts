import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { JsonInputValue } from "~/types/json";

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

export const docsRouter = createTRPCRouter({
  createDoc: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const count = await ctx.db.document.count({
      where: {
        userId,
      },
    });

    if (count >= 100) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Document limit reached",
      });
    }

    const doc = await ctx.db.document.create({
      data: {
        userId,
      },
    });

    return {
      ...doc,
      content: doc.content ?? "",
    };
  }),

  getUserDocs: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const docs = await ctx.db.document.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return docs;
  }),

  getSelectedDoc: protectedProcedure
    .input(
      z.object({
        docId: z.string().nonempty(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const doc = await ctx.db.document.findUnique({
        where: {
          id: input.docId,
          userId,
        },
      });

      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      return doc;
    }),

  deleteDoc: protectedProcedure
    .input(z.object({ docId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db.document.delete({
        where: {
          id: input.docId,
          userId,
        },
      });

      return {
        success: true,
      };
    }),

  renameDocTitle: protectedProcedure
    .input(
      z.object({
        docId: z.string().nonempty(),
        title: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      await ctx.db.document.update({
        where: {
          userId,
          id: input.docId,
        },
        data: {
          title: input.title,
        },
      });

      return {
        success: true,
      };
    }),

  saveDoc: protectedProcedure
    .input(
      z.object({
        docId: z.string().nonempty(),
        title: z.string().nonempty(),
        content: jsonSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      await ctx.db.document.update({
        where: {
          userId,
          id: input.docId,
        },
        data: {
          title: input.title,
          content: input.content,
        },
      });

      return {
        success: true,
      };
    }),
});
