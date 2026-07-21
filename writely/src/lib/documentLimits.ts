import type { JSONContent } from "@tiptap/core";

export const MAX_DOCUMENTS_PER_USER = 20;
export const MAX_DOCUMENT_CHARACTERS = 50_000;
export const MAX_DOCUMENT_TITLE_LENGTH = 200;

export function countDocumentCharacters(content: JSONContent): number {
  const ownTextLength =
    typeof content.text === "string" ? content.text.length : 0;

  return (
    ownTextLength +
    (content.content ?? []).reduce(
      (total, child) => total + countDocumentCharacters(child),
      0,
    )
  );
}
