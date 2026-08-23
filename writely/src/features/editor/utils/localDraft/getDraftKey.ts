import { LOCAL_DRAFT_PREFIX } from "./constants";

export default function getDraftKey(docId: string): string {
  return `${LOCAL_DRAFT_PREFIX}${docId}`;
}
