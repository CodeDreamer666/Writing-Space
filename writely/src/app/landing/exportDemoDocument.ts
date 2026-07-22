import type { JSONContent } from "@tiptap/core";
import { downloadExport } from "~/features/editor/utils/exportDownload";
import {
  exportDocumentContent,
  type ExportFormat,
} from "~/server/documents/exportDocument";

export const DEMO_EXPORT_TITLE = "Writely: Project brief";

export const DEMO_EXPORT_CONTENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Project brief" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "The draft is ready to share." }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Key ideas", marks: [{ type: "bold" }] },
        { type: "text", text: " stay clear; " },
        { type: "text", text: "your voice", marks: [{ type: "italic" }] },
        { type: "text", text: " remains." },
      ],
    },
  ],
};

const mimeTypes: Record<ExportFormat, string> = {
  txt: "text/plain;charset=utf-8",
  md: "text/markdown;charset=utf-8",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function encodeBase64(bytes: Uint8Array) {
  let binary = "";

  for (let start = 0; start < bytes.length; start += 8_192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8_192));
  }

  return window.btoa(binary);
}

async function createDemoDocx() {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } =
    await import("docx");
  const document = new Document({
    creator: "Writely",
    title: DEMO_EXPORT_TITLE,
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            text: "Project brief",
          }),
          new Paragraph("The draft is ready to share."),
          new Paragraph({
            children: [
              new TextRun({ text: "Key ideas", bold: true }),
              new TextRun(" stay clear; "),
              new TextRun({ text: "your voice", italics: true }),
              new TextRun(" remains."),
            ],
          }),
        ],
      },
    ],
  });
  return Packer.toBase64String(document);
}

async function createDemoPdf() {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();

  pdf.setTitle(DEMO_EXPORT_TITLE);
  pdf.setCreator("Writely");

  const page = pdf.addPage([612, 792]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const color = rgb(0.12, 0.14, 0.16);

  page.drawText("Project brief", {
    x: 64,
    y: 728,
    size: 17,
    font: bold,
    color,
  });
  page.drawText("The draft is ready to share.", {
    x: 64,
    y: 690,
    size: 11,
    font: regular,
    color,
  });

  const y = 670;
  const boldText = "Key ideas";
  const regularText = " stay clear; ";

  page.drawText(boldText, { x: 64, y, size: 11, font: bold, color });
  const regularX = 64 + bold.widthOfTextAtSize(boldText, 11);
  page.drawText(regularText, {
    x: regularX,
    y,
    size: 11,
    font: regular,
    color,
  });
  const italicX = regularX + regular.widthOfTextAtSize(regularText, 11);
  page.drawText("your voice", { x: italicX, y, size: 11, font: italic, color });
  const finalX = italicX + italic.widthOfTextAtSize("your voice", 11);
  page.drawText(" remains.", { x: finalX, y, size: 11, font: regular, color });

  return pdf.save();
}

export async function downloadDemoExport(format: ExportFormat) {
  if (format === "txt" || format === "md") {
    downloadExport({
      title: DEMO_EXPORT_TITLE,
      content: exportDocumentContent(DEMO_EXPORT_CONTENT, format),
      encoding: "utf8",
      format,
      mimeType: mimeTypes[format],
    });
    return;
  }

  const content =
    format === "pdf"
      ? encodeBase64(await createDemoPdf())
      : await createDemoDocx();

  downloadExport({
    title: DEMO_EXPORT_TITLE,
    content,
    encoding: "base64",
    format,
    mimeType: mimeTypes[format],
  });
}
