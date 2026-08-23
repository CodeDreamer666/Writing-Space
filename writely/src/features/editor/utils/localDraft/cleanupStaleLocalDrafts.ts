import {
  DISCARDED_DRAFT_PREFIX,
  LOCAL_DRAFT_MAX_AGE_MS,
  LOCAL_DRAFT_PREFIX,
} from "./constants";
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
    purgeStaleDiscardedDrafts();
  } catch {}
}

function purgeStaleDiscardedDrafts() {
  const keys = Array.from(
    { length: window.localStorage.length },
    (_, index) => window.localStorage.key(index),
  ).filter(
    (key): key is string => key?.startsWith(DISCARDED_DRAFT_PREFIX) ?? false,
  );

  keys.forEach((key) => {
    try {
      const value = window.localStorage.getItem(key);
      const discardedAt = value
        ? (JSON.parse(value) as { discardedAt?: unknown }).discardedAt
        : null;
      const age =
        typeof discardedAt === "string"
          ? Date.now() - Date.parse(discardedAt)
          : Number.NaN;

      if (!Number.isFinite(age) || age < 0 || age > LOCAL_DRAFT_MAX_AGE_MS) {
        window.localStorage.removeItem(key);
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  });
}
