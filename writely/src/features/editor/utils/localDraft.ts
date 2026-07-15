import type { JSONContent } from "@tiptap/core";
import { isEditorContent } from "./editorContent";

const LOCAL_DRAFT_SCHEMA_VERSION = 1;
const LOCAL_DRAFT_PREFIX = "writely:local-draft:";

export type LocalDraft = {
  schemaVersion: typeof LOCAL_DRAFT_SCHEMA_VERSION;
  docId: string;
  title: string;
  content: JSONContent;
  baseVersion: number;
  savedAt: string;
};

function getDraftKey(docId: string): string {
  return `${LOCAL_DRAFT_PREFIX}${docId}`;
}

export function readLocalDraft(docId: string): LocalDraft | null {
  try {
    const value = window.localStorage.getItem(getDraftKey(docId));

    if (!value) {
      return null;
    }

    const draft = JSON.parse(value) as Partial<LocalDraft>;

    if (
      draft.schemaVersion !== LOCAL_DRAFT_SCHEMA_VERSION ||
      draft.docId !== docId ||
      typeof draft.title !== "string" ||
      typeof draft.baseVersion !== "number" ||
      !Number.isInteger(draft.baseVersion) ||
      draft.baseVersion < 0 ||
      typeof draft.savedAt !== "string" ||
      !isEditorContent(draft.content)
    ) {
      return null;
    }

    return draft as LocalDraft;
  } catch {
    return null;
  }
}

export function writeLocalDraft(draft: Omit<LocalDraft, "schemaVersion">) {
  try {
    window.localStorage.setItem(
      getDraftKey(draft.docId),
      JSON.stringify({
        ...draft,
        schemaVersion: LOCAL_DRAFT_SCHEMA_VERSION,
      }),
    );

    return true;
  } catch {
    return false;
  }
}

export function clearLocalDraft(docId: string) {
  try {
    window.localStorage.removeItem(getDraftKey(docId));
  } catch {
    // A blocked storage API must not prevent a confirmed server save.
  }
}

export function canSafelyAutosaveDraft(
  draft: LocalDraft,
  serverVersion: number,
): boolean {
  return draft.baseVersion === serverVersion;
}

export function serializeDraft(title: string, content: JSONContent): string {
  return JSON.stringify({ title, content });
}
