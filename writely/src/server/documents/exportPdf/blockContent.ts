import type { JSONContent } from "@tiptap/core";
import type { Content } from "pdfmake/interfaces";
import { PDF_MUTED_COLOR, PDF_RULE_COLOR } from "../exportPdfConstants";
import inlineContent from "./inlineContent";
import listContent from "./listContent";
import listItemContent from "./listItemContent";
import paragraphContent from "./paragraphContent";

export default function blockContent(node: JSONContent): Content[] {
  switch (node.type) {
    case "paragraph":
      return [paragraphContent(node)];
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 1, 1), 3);
      return [
        {
          text: inlineContent(node),
          style: `heading${level}`,
          margin: [0, level === 1 ? 12 : 8, 0, 8],
        },
      ];
    }
    case "bulletList":
    case "orderedList":
      return [listContent(node)];
    case "listItem":
      return [listItemContent(node)];
    case "blockquote": {
      const quoteBlocks = (node.content ?? []).flatMap(blockContent);
      return [
        {
          stack:
            quoteBlocks.length > 0
              ? quoteBlocks
              : [{ text: " ", margin: [0, 0, 0, 10] }],
          color: PDF_MUTED_COLOR,
          italics: true,
          margin: [18, 4, 0, 12],
        },
      ];
    }
    case "horizontalRule":
      return [
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 467,
              y2: 0,
              lineColor: PDF_RULE_COLOR,
              lineWidth: 0.75,
            },
          ],
          margin: [0, 8, 0, 16],
        },
      ];
    case "pageBreak":
      return [{ text: "", pageBreak: "before" }];
    default:
      return (node.content ?? []).flatMap(blockContent);
  }
}
