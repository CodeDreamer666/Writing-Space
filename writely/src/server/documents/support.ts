import { TRPCError } from "@trpc/server";
import type { JSONContent } from "@tiptap/core";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import countDocumentCharacters from "~/lib/countDocumentCharacters";
import {
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
  MAX_DOCUMENT_TITLE_LENGTH,
  MAX_INITIAL_DRAFT_CHARACTERS,
} from "~/lib/documentLimits";
import containsUnsupportedPictographs from "~/lib/containsUnsupportedPictographs";
import documentContainsUnsupportedPictographs from "~/lib/documentContainsUnsupportedPictographs";
import { UNSUPPORTED_PICTOGRAPH_MESSAGE } from "~/lib/writingLanguage";
import exportDocumentContent from "~/server/documents/exportDocument";
import exportPdfDocument from "~/server/documents/exportPdfDocument";
import exportRichDocument from "~/server/documents/exportRichDocument";
import { WRITING_MODES } from "~/types/writing";
export type JsonInputObject = {
  readonly [key: string]: JsonInputValue | null | undefined;
};
export type JsonInputArray = readonly (JsonInputValue | null)[];
export type JsonInputValue =
  | string
  | number
  | boolean
  | JsonInputObject
  | JsonInputArray;
export const MAX_DOCUMENT_BYTES = 1000000;
export const DOCUMENT_NOT_FOUND_MESSAGE =
  "This document is unavailable or belongs to another account.";
export const DOCUMENT_CONFLICT_MESSAGE =
  "A newer saved version exists. Your recovered writing is still safe in this browser.";
export const MAX_TITLE_LENGTH = MAX_DOCUMENT_TITLE_LENGTH;
export const docIdSchema = z.string().uuid();
export const titleSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_TITLE_LENGTH)
  .refine(
    (title) => !containsUnsupportedPictographs(title),
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
  );
export const jsonValueSchema: z.ZodType<JsonInputValue | null> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);
export const jsonSchema: z.ZodType<JsonInputValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);
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
      !documentContainsUnsupportedPictographs(content as JSONContent),
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
  )
  .refine(
    (content) =>
      new TextEncoder().encode(JSON.stringify(content)).length <=
      MAX_DOCUMENT_BYTES,
    `Document content must be ${MAX_DOCUMENT_BYTES} bytes or less`,
  );
export const emptyDocumentContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
import containsUnsafeUrl from "./helpers/containsUnsafeUrl";
import createInitialDocumentContent from "./helpers/createInitialDocumentContent";
import hasSameDocumentSnapshot from "./helpers/hasSameDocumentSnapshot";
import createDocumentNotFoundError from "./helpers/createDocumentNotFoundError";
import createDocumentConflictError from "./helpers/createDocumentConflictError";
export {
  TRPCError,
  isDeepStrictEqual,
  z,
  countDocumentCharacters,
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
  MAX_DOCUMENT_TITLE_LENGTH,
  MAX_INITIAL_DRAFT_CHARACTERS,
  containsUnsupportedPictographs,
  documentContainsUnsupportedPictographs,
  UNSUPPORTED_PICTOGRAPH_MESSAGE,
  exportDocumentContent,
  exportPdfDocument,
  exportRichDocument,
  WRITING_MODES,
  containsUnsafeUrl,
  createInitialDocumentContent,
  hasSameDocumentSnapshot,
  createDocumentNotFoundError,
  createDocumentConflictError,
};
export type { JSONContent };
