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
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

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
  const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);

  pdfMake.vfs = pdfFonts;

  return new Promise<string>((resolve) => {
    pdfMake
      .createPdf({
        info: {
          title: DEMO_EXPORT_TITLE,
          author: "Writely",
          creator: "Writely",
        },
        pageSize: "A4",
        pageMargins: [64, 64, 64, 64],
        defaultStyle: {
          font: "Roboto",
          fontSize: 11,
          lineHeight: 1.35,
        },
        content: [
          {
            text: DEMO_EXPORT_TITLE,
            bold: true,
            fontSize: 22,
            margin: [0, 0, 0, 24],
          },
          {
            text: "Project brief",
            bold: true,
            fontSize: 15,
            margin: [0, 0, 0, 8],
          },
          {
            text: "The draft is ready to share.",
            margin: [0, 0, 0, 10],
          },
          {
            text: [
              { text: "Key ideas", bold: true },
              { text: " stay clear; " },
              { text: "your voice", italics: true },
              { text: " remains." },
            ],
          },
        ],
      })
      .getBase64(resolve);
  });
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
    format === "pdf" ? await createDemoPdf() : await createDemoDocx();

  downloadExport({
    title: DEMO_EXPORT_TITLE,
    content,
    encoding: "base64",
    format,
    mimeType: mimeTypes[format],
  });
}
