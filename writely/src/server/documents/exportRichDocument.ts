import type { JSONContent } from "@tiptap/core";
import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

type RichExportFormat = "pdf" | "docx";

type StyledRun = {
  text: string;
  bold: boolean;
  italic: boolean;
};

type ContentBlock = {
  kind: "paragraph" | "heading" | "list" | "blockquote";
  level?: number;
  marker?: string;
  runs: StyledRun[];
};

function collectRuns(node: JSONContent): StyledRun[] {
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

function collectBlocks(content: JSONContent): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const visit = (node: JSONContent) => {
    if (node.type === "heading") {
      blocks.push({
        kind: "heading",
        level: Number(node.attrs?.level) || 1,
        runs: collectRuns(node),
      });
      return;
    }

    if (node.type === "paragraph") {
      blocks.push({ kind: "paragraph", runs: collectRuns(node) });
      return;
    }

    if (node.type === "bulletList" || node.type === "orderedList") {
      const start = Number(node.attrs?.start ?? 1);

      for (const [index, item] of (node.content ?? []).entries()) {
        blocks.push({
          kind: "list",
          marker: node.type === "orderedList" ? `${start + index}.` : "•",
          runs: collectRuns(item),
        });
      }
      return;
    }

    if (node.type === "blockquote") {
      for (const child of node.content ?? []) {
        blocks.push({
          kind: "blockquote",
          runs: collectRuns(child),
        });
      }
      return;
    }

    for (const child of node.content ?? []) {
      visit(child);
    }
  };

  visit(content);
  return blocks;
}

function createDocx(content: JSONContent, title: string) {
  const paragraphs = collectBlocks(content).map((block) => {
    const children = block.runs.map(
      (run) =>
        new TextRun({
          text: run.text,
          bold: run.bold,
          italics: run.italic || block.kind === "blockquote",
          break: run.text === "\n" ? 1 : undefined,
        }),
    );

    if (block.marker) {
      children.unshift(new TextRun({ text: `${block.marker} ` }));
    }

    const heading =
      block.kind === "heading"
        ? block.level === 1
          ? HeadingLevel.HEADING_1
          : block.level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3
        : undefined;

    return new Paragraph({
      children,
      heading,
      indent: block.kind === "blockquote" ? { left: 360 } : undefined,
      border:
        block.kind === "blockquote"
          ? {
              left: {
                color: "AEB4BE",
                space: 8,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            }
          : undefined,
      spacing: { after: block.kind === "heading" ? 220 : 160 },
    });
  });

  return new Document({
    creator: "Writely",
    title,
    sections: [{ children: paragraphs }],
  });
}

function fontForRun(
  run: StyledRun,
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
    boldItalic: PDFFont;
  },
) {
  if (run.bold && run.italic) {
    return fonts.boldItalic;
  }

  if (run.bold) {
    return fonts.bold;
  }

  return run.italic ? fonts.italic : fonts.regular;
}

async function createPdf(content: JSONContent, title: string) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setCreator("Writely");

  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
  };
  const pageSize: [number, number] = [612, 792];
  const margin = 64;
  const maxWidth = pageSize[0] - margin * 2;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  const ensureSpace = (height: number) => {
    if (y - height >= margin) {
      return;
    }

    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  };

  for (const block of collectBlocks(content)) {
    const fontSize =
      block.kind === "heading" ? (block.level === 1 ? 22 : 17) : 11;
    const lineHeight = fontSize * 1.45;
    const runs = block.marker
      ? [
          { text: `${block.marker} `, bold: false, italic: false },
          ...block.runs,
        ]
      : block.kind === "blockquote"
        ? [
            { text: "| ", bold: false, italic: false },
            ...block.runs.map((run) => ({ ...run, italic: true })),
          ]
        : block.runs;
    let x = margin;

    ensureSpace(lineHeight * 2);

    for (const run of runs) {
      const font = fontForRun(run, fonts);
      const words = run.text.replaceAll("\n", " \n ").split(/(\s+)/);

      for (const word of words) {
        if (!word) {
          continue;
        }

        if (word.includes("\n")) {
          x = margin;
          y -= lineHeight;
          ensureSpace(lineHeight);
          continue;
        }

        const width = font.widthOfTextAtSize(word, fontSize);

        if (x > margin && x + width > margin + maxWidth) {
          x = margin;
          y -= lineHeight;
          ensureSpace(lineHeight);
        }

        page.drawText(word, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.12, 0.14, 0.16),
        });
        x += width;
      }
    }

    y -= lineHeight * (block.kind === "heading" ? 1.35 : 1.15);
  }

  return pdf.save();
}

export async function exportRichDocument(
  content: JSONContent,
  title: string,
  format: RichExportFormat,
): Promise<Buffer> {
  if (format === "docx") {
    return Packer.toBuffer(createDocx(content, title));
  }

  return Buffer.from(await createPdf(content, title));
}
