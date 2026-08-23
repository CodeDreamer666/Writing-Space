import type { JSONContent } from "@tiptap/core";
import countUnsupportedPictographs from "./countUnsupportedPictographs";

export default function documentContainsUnsupportedPictographs(
  content: JSONContent,
): boolean {
  if (
    typeof content.text === "string" &&
    countUnsupportedPictographs(content.text) > 0
  )
    return true;
  return (
    content.content?.some((node) =>
      documentContainsUnsupportedPictographs(node),
    ) ?? false
  );
}
