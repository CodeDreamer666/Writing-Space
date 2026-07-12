import type { JSONContent } from "@tiptap/core";

export const DEFAULT_TITLE = "Untitled draft";

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function readingTime(words: number): string {
  const mins = Math.max(1, Math.ceil(words / 200));
  return mins === 1 ? "~1 min read" : `~${mins} min read`;
}

export function isEditorContent(content: unknown): content is JSONContent {
  return (
    typeof content === "object" && content !== null && !Array.isArray(content)
  );
}

export function toEditorHtml(content: string): string {
  const escapeHtml = (value: string): string =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  return content
    .split(/\n{2,}/)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
    )
    .join("");
}
