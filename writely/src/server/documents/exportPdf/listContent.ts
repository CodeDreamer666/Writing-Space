import type { JSONContent } from "@tiptap/core";
import type { Content } from "pdfmake/interfaces";
import listItemContent from "./listItemContent";

export default function listContent(node: JSONContent): Content {
  const items = (node.content ?? []).map(listItemContent);

  if (node.type === "orderedList") {
    return {
      ol: items,
      start: Number(node.attrs?.start ?? 1),
      margin: [18, 0, 0, 10],
    };
  }

  return { ul: items, margin: [18, 0, 0, 10] };
}
