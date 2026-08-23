import {
  CREATE_AFTER_AUTH_KEY,
  PENDING_DRAFT_TEXT_KEY,
} from "./pendingDraftConstants";

export default function clearPendingDraft() {
  try {
    window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
    window.sessionStorage.removeItem(PENDING_DRAFT_TEXT_KEY);
  } catch {}
}
