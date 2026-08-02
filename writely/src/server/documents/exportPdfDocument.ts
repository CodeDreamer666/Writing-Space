import type { JSONContent } from "@tiptap/core";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type {
  Content,
  ContentText,
  TDocumentDefinitions,
} from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts;

const PDF_TEXT_COLOR = "#202124";
const PDF_MUTED_COLOR = "#5F6368";
const PDF_RULE_COLOR = "#DADCE0";

function inlineContent(node: JSONContent): Content[] {
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

  if (node.type === "hardBreak") {
    return [{ text: "\n" }];
  }

  return (node.content ?? []).flatMap(inlineContent);
}

function paragraphContent(
  node: JSONContent,
  margin: [number, number, number, number] = [0, 0, 0, 10],
): ContentText {
  const text = inlineContent(node);

  return {
    text: text.length > 0 ? text : " ",
    margin,
  };
}

function listItemContent(node: JSONContent): Content {
  const blocks = (node.content ?? []).flatMap(blockContent);

  if (blocks.length === 0) {
    return { text: " " };
  }

  return blocks.length === 1 ? blocks[0]! : { stack: blocks };
}

function listContent(node: JSONContent): Content {
  const items = (node.content ?? []).map(listItemContent);

  if (node.type === "orderedList") {
    return {
      ol: items,
      start: Number(node.attrs?.start ?? 1),
      margin: [18, 0, 0, 10],
    };
  }

  return {
    ul: items,
    margin: [18, 0, 0, 10],
  };
}

function blockContent(node: JSONContent): Content[] {
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

function createPdfDefinition(
  content: JSONContent,
  title: string,
): TDocumentDefinitions {
  const documentBlocks = (content.content ?? []).flatMap(blockContent);
  const documentTitle = title.trim() || "Untitled draft";

  return {
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
      documentTitle: {
        bold: true,
        fontSize: 22,
        lineHeight: 1.15,
      },
      heading1: {
        bold: true,
        fontSize: 18,
        lineHeight: 1.2,
      },
      heading2: {
        bold: true,
        fontSize: 15,
        lineHeight: 1.25,
      },
      heading3: {
        bold: true,
        fontSize: 13,
        lineHeight: 1.25,
      },
    },
    content: [
      {
        text: documentTitle,
        style: "documentTitle",
        margin: [0, 0, 0, 24],
      },
      ...documentBlocks,
    ],
  };
}

export async function exportPdfDocument(
  content: JSONContent,
  title: string,
): Promise<Buffer> {
  return new Promise((resolve) => {
    pdfMake.createPdf(createPdfDefinition(content, title)).getBuffer(resolve);
  });
}
