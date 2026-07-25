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

  downloadExport({
    title: DEMO_EXPORT_TITLE,
    content: await createDemoDocx(),
    encoding: "base64",
    format,
    mimeType: mimeTypes[format],
  });
}
