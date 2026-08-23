import { CREATE_AFTER_AUTH_KEY } from "./pendingDraftConstants";

export default function hasPendingDraft(): boolean {
  try {
    return window.sessionStorage.getItem(CREATE_AFTER_AUTH_KEY) === "true";
  } catch {
    return false;
  }
}
