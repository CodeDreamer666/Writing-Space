import isEditorContent from "../editorContent/isEditorContent";
import {
  LOCAL_DRAFT_MAX_AGE_MS,
  LOCAL_DRAFT_SCHEMA_VERSION,
  type LocalDraft,
} from "./constants";
import getDraftKey from "./getDraftKey";

export default function readLocalDraft(docId: string): LocalDraft | null {
  try {
    const value = window.localStorage.getItem(getDraftKey(docId));
    if (!value) return null;
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
    } catch {}
    return null;
  }
}
