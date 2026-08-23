import type { JSONContent } from "@tiptap/core";
import type { ContentText } from "pdfmake/interfaces";
import inlineContent from "./inlineContent";

export default function paragraphContent(
  node: JSONContent,
  margin: [number, number, number, number] = [0, 0, 0, 10],
): ContentText {
  const text = inlineContent(node);
  return { text: text.length > 0 ? text : " ", margin };
}
