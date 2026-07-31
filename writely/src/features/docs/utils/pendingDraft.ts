import { MAX_INITIAL_DRAFT_CHARACTERS } from "~/lib/documentLimits";

export const MAX_PENDING_DRAFT_CHARACTERS = MAX_INITIAL_DRAFT_CHARACTERS;

const CREATE_AFTER_AUTH_KEY = "writely:create-after-auth";
const PENDING_DRAFT_TEXT_KEY = "writely:pending-draft-text";

export function queuePendingDraft(text: string): boolean {
  if (text.length > MAX_PENDING_DRAFT_CHARACTERS) {
    return false;
  }

  try {
    if (text.length > 0) {
      window.sessionStorage.setItem(PENDING_DRAFT_TEXT_KEY, text);
    } else {
      window.sessionStorage.removeItem(PENDING_DRAFT_TEXT_KEY);
    }

    window.sessionStorage.setItem(CREATE_AFTER_AUTH_KEY, "true");
    return true;
  } catch {
    return false;
  }
}

export function hasPendingDraft(): boolean {
  try {
    return window.sessionStorage.getItem(CREATE_AFTER_AUTH_KEY) === "true";
  } catch {
    return false;
  }
}

export function readPendingDraftText(): string | null {
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

export function clearPendingDraft() {
  try {
    window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
    window.sessionStorage.removeItem(PENDING_DRAFT_TEXT_KEY);
  } catch {
    // A blocked storage API must not prevent the authenticated app from opening.
  }
}
