import type { LocalDraft } from "./constants";

export default function canSafelyAutosaveDraft(
  draft: LocalDraft,
  serverVersion: number,
): boolean {
  return draft.baseVersion === serverVersion;
}
