import { LOCAL_DRAFT_SCHEMA_VERSION, type LocalDraft } from "./constants";
import getDraftKey from "./getDraftKey";

export default function writeLocalDraft(
  draft: Omit<LocalDraft, "schemaVersion">,
) {
  try {
    window.localStorage.setItem(
      getDraftKey(draft.docId),
      JSON.stringify({ ...draft, schemaVersion: LOCAL_DRAFT_SCHEMA_VERSION }),
    );
    return true;
  } catch {
    return false;
  }
}
