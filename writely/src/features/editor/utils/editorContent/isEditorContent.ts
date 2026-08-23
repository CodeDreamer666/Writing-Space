import type { JSONContent } from "@tiptap/core";

export default function isEditorContent(
  content: unknown,
): content is JSONContent {
  return (
    typeof content === "object" && content !== null && !Array.isArray(content)
  );
}
