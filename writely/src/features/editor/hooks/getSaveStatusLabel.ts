import type { SaveStatus } from "./useDocumentSave";

export default function getSaveStatusLabel(status: SaveStatus) {
  if (status === "error") {
    return "Save failed";
  }

  if (status === "saved") {
    return "Saved";
  }

  if (status === "conflict") {
    return "Resolve conflict";
  }

  if (status === "recovery") {
    return "Recovery available";
  }

  if (status === "unsaved") {
    return "Unsaved changes";
  }

  return "Saving now…";
}
