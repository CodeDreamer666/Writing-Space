import getDraftKey from "./getDraftKey";

export default function clearLocalDraft(docId: string) {
  try {
    window.localStorage.removeItem(getDraftKey(docId));
  } catch {}
}
