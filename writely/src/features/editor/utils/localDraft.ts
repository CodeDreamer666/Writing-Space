import type { JSONContent } from "@tiptap/core";
import { isEditorContent } from "./editorContent";

const LOCAL_DRAFT_SCHEMA_VERSION = 1;
const LOCAL_DRAFT_PREFIX = "writely:local-draft:";
export const LOCAL_DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1_000;

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
    const savedAtTime =
      typeof draft.savedAt === "string"
        ? Date.parse(draft.savedAt)
        : Number.NaN;
    const age = Date.now() - savedAtTime;

    if (
      draft.schemaVersion !== LOCAL_DRAFT_SCHEMA_VERSION ||
      draft.docId !== docId ||
      typeof draft.title !== "string" ||
      typeof draft.baseVersion !== "number" ||
      !Number.isInteger(draft.baseVersion) ||
      draft.baseVersion < 0 ||
      typeof draft.savedAt !== "string" ||
      !Number.isFinite(savedAtTime) ||
      age < 0 ||
      age > LOCAL_DRAFT_MAX_AGE_MS ||
      !isEditorContent(draft.content)
    ) {
      window.localStorage.removeItem(getDraftKey(docId));
      return null;
    }

    return draft as LocalDraft;
  } catch {
    try {
      window.localStorage.removeItem(getDraftKey(docId));
    } catch {
      // Storage access can be blocked by browser privacy settings.
    }

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

export function clearAllLocalDrafts() {
  try {
    const draftKeys = Array.from(
      { length: window.localStorage.length },
      (_, index) => window.localStorage.key(index),
    ).filter(
      (key): key is string => key?.startsWith(LOCAL_DRAFT_PREFIX) ?? false,
    );

    draftKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch {
    // Blocked storage must not prevent the requested server or browser action.
  }
}

export function cleanupStaleLocalDrafts() {
  try {
    const docIds = Array.from(
      { length: window.localStorage.length },
      (_, index) => window.localStorage.key(index),
    )
      .filter(
        (key): key is string => key?.startsWith(LOCAL_DRAFT_PREFIX) ?? false,
      )
      .map((key) => key.slice(LOCAL_DRAFT_PREFIX.length));

    docIds.forEach((docId) => {
      readLocalDraft(docId);
    });
  } catch {
    // Browser cleanup is best effort when storage access is blocked.
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
