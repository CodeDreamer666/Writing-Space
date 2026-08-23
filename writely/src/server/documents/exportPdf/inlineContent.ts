import type { JSONContent } from "@tiptap/core";
import type { Content } from "pdfmake/interfaces";

export default function inlineContent(node: JSONContent): Content[] {
  if (node.type === "text") {
    const marks = node.marks ?? [];
    return [
      {
        text: node.text ?? "",
        bold: marks.some((mark) => mark.type === "bold"),
        italics: marks.some((mark) => mark.type === "italic"),
      },
    ];
  }

  if (node.type === "hardBreak") return [{ text: "\n" }];
  return (node.content ?? []).flatMap(inlineContent);
}
