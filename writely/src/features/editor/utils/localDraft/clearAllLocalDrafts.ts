import { LOCAL_DRAFT_PREFIX } from "./constants";

export default function clearAllLocalDrafts() {
  try {
    const keys = Array.from(
      { length: window.localStorage.length },
      (_, index) => window.localStorage.key(index),
    ).filter(
      (key): key is string => key?.startsWith(LOCAL_DRAFT_PREFIX) ?? false,
    );
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {}
}
