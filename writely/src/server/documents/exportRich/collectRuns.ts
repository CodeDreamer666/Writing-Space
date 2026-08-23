import type { JSONContent } from "@tiptap/core";
import type { StyledRun } from "../exportRichTypes";

export default function collectRuns(node: JSONContent): StyledRun[] {
  if (node.type === "text") {
    const marks = node.marks ?? [];

    return [
      {
        text: node.text ?? "",
        bold: marks.some((mark) => mark.type === "bold"),
        italic: marks.some((mark) => mark.type === "italic"),
      },
    ];
  }

  if (node.type === "hardBreak") {
    return [{ text: "\n", bold: false, italic: false }];
  }

  return (node.content ?? []).flatMap(collectRuns);
}
