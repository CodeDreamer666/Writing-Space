import type { JSONContent } from "@tiptap/core";
import type { Content } from "pdfmake/interfaces";
import blockContent from "./blockContent";

export default function listItemContent(node: JSONContent): Content {
  const blocks = (node.content ?? []).flatMap(blockContent);
  if (blocks.length === 0) return { text: " " };
  return blocks.length === 1 ? blocks[0]! : { stack: blocks };
}
