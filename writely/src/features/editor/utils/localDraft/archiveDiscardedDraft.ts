import { DISCARDED_DRAFT_PREFIX, LOCAL_DRAFT_SCHEMA_VERSION } from "./constants";
import readLocalDraft from "./readLocalDraft";

/**
 * Keeps a copy of a draft the user is about to discard, so writing is never
 * destroyed outright. The copy is never read back into the editor; it exists so
 * the text can still be recovered from browser storage.
 */
export default function archiveDiscardedDraft(docId: string) {
  const draft = readLocalDraft(docId);
  if (!draft) return false;
  try {
    window.localStorage.setItem(
      `${DISCARDED_DRAFT_PREFIX}${docId}`,
      JSON.stringify({
        ...draft,
        schemaVersion: LOCAL_DRAFT_SCHEMA_VERSION,
        discardedAt: new Date().toISOString(),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
