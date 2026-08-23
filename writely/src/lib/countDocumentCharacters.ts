import type { JSONContent } from "@tiptap/core";

export default function countDocumentCharacters(content: JSONContent): number {
  if (typeof content.text === "string") return content.text.length;
  return (
    content.content?.reduce(
      (total, node) => total + countDocumentCharacters(node),
      0,
    ) ?? 0
  );
}
