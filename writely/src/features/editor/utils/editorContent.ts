import type { JSONContent } from "@tiptap/core";

export const DEFAULT_TITLE = "Untitled draft";

const ENGLISH_WORD_PATTERN =
  /[\p{L}\p{N}]+(?:['’\u2010-\u2015-][\p{L}\p{N}]+)*/gu;

export function countWords(text: string): number {
  return text.match(ENGLISH_WORD_PATTERN)?.length ?? 0;
}

export function readingTime(words: number): string {
  if (words < 240) {
    return "Less than 1 min read";
  }

  const minutes = Math.ceil(words / 240);
  return minutes === 1 ? "1 min read" : `${minutes} min read`;
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
