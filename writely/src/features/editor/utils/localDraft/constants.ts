import type { JSONContent } from "@tiptap/core";

export const LOCAL_DRAFT_SCHEMA_VERSION = 1;
export const LOCAL_DRAFT_PREFIX = "writely:local-draft:";
export const LOCAL_DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1_000;
export type LocalDraft = {
  schemaVersion: typeof LOCAL_DRAFT_SCHEMA_VERSION;
  docId: string;
  title: string;
  content: JSONContent;
  baseVersion: number;
  savedAt: string;
};
