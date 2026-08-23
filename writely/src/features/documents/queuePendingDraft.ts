import {
  CREATE_AFTER_AUTH_KEY,
  MAX_PENDING_DRAFT_CHARACTERS,
  PENDING_DRAFT_TEXT_KEY,
} from "./pendingDraftConstants";

export default function queuePendingDraft(text: string): boolean {
  if (text.length > MAX_PENDING_DRAFT_CHARACTERS) return false;
  try {
    if (text.length > 0)
      window.sessionStorage.setItem(PENDING_DRAFT_TEXT_KEY, text);
    else window.sessionStorage.removeItem(PENDING_DRAFT_TEXT_KEY);
    window.sessionStorage.setItem(CREATE_AFTER_AUTH_KEY, "true");
    return true;
  } catch {
    return false;
  }
}
