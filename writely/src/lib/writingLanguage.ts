import type { JSONContent } from "@tiptap/core";

export const UNSUPPORTED_PICTOGRAPH_MESSAGE =
  "Emoji and decorative pictographs are not supported. Use normal punctuation, numbers, or useful symbols instead.";

const usefulPictographs = new Set(["©", "®", "™"]);
const pictographPattern =
  /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[0-9#*]\uFE0F?\u20E3)/gu;

export function countUnsupportedPictographs(value: string): number {
  return Array.from(value.matchAll(pictographPattern)).filter(
    ([match]) => !usefulPictographs.has(match),
  ).length;
}

export function containsUnsupportedPictographs(value: string): boolean {
  return countUnsupportedPictographs(value) > 0;
}

export function documentContainsUnsupportedPictographs(
  content: JSONContent,
): boolean {
  if (
    content.type === "text" &&
    containsUnsupportedPictographs(content.text ?? "")
  ) {
    return true;
  }

  return (content.content ?? []).some(documentContainsUnsupportedPictographs);
}
