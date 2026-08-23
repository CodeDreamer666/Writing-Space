import { LOCAL_DRAFT_PREFIX } from "./constants";
import readLocalDraft from "./readLocalDraft";

export default function cleanupStaleLocalDrafts() {
  try {
    const docIds = Array.from(
      { length: window.localStorage.length },
      (_, index) => window.localStorage.key(index),
    )
      .filter(
        (key): key is string => key?.startsWith(LOCAL_DRAFT_PREFIX) ?? false,
      )
      .map((key) => key.slice(LOCAL_DRAFT_PREFIX.length));
    docIds.forEach((docId) => readLocalDraft(docId));
  } catch {}
}
