import {
  MAX_PENDING_DRAFT_CHARACTERS,
  PENDING_DRAFT_TEXT_KEY,
} from "./pendingDraftConstants";

export default function readPendingDraftText(): string | null {
  try {
    const text = window.sessionStorage.getItem(PENDING_DRAFT_TEXT_KEY) ?? "";
    if (text.length > MAX_PENDING_DRAFT_CHARACTERS) {
      window.sessionStorage.removeItem(PENDING_DRAFT_TEXT_KEY);
      return null;
    }
    return text;
  } catch {
    return null;
  }
}
