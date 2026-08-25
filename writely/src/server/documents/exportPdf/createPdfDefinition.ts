import type { JSONContent } from "@tiptap/core";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { PDF_TEXT_COLOR } from "../exportPdfConstants";
import blockContent from "./blockContent";

export default function createPdfDefinition(
  content: JSONContent,
  title: string,
): TDocumentDefinitions {
  const documentBlocks = (content.content ?? []).flatMap(blockContent);
  const documentTitle = title.trim() || "Untitled draft";

  return {
    tagged: true,
    displayTitle: true,
    info: {
      title: documentTitle,
      author: "Writely",
      creator: "Writely",
      producer: "Writely",
    },
    pageSize: "A4",
    pageMargins: [64, 64, 64, 64],
    defaultStyle: {
      font: "Roboto",
      fontSize: 11,
      lineHeight: 1.35,
      color: PDF_TEXT_COLOR,
    },
    styles: {
      documentTitle: { bold: true, fontSize: 22, lineHeight: 1.15 },
      heading1: { bold: true, fontSize: 18, lineHeight: 1.2 },
      heading2: { bold: true, fontSize: 15, lineHeight: 1.25 },
      heading3: { bold: true, fontSize: 13, lineHeight: 1.25 },
    },
    content: [
      { text: documentTitle, style: "documentTitle", margin: [0, 0, 0, 24] },
      ...documentBlocks,
    ],
  };
}
