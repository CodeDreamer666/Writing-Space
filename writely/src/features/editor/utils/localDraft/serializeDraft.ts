import type { JSONContent } from "@tiptap/core";

export default function serializeDraft(
  title: string,
  content: JSONContent,
): string {
  return JSON.stringify({ title, content });
}
