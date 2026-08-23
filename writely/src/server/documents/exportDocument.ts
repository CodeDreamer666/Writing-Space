import type { JSONContent } from "@tiptap/core";
import renderNode from "./exportText/renderNode";

export type ExportFormat = "txt" | "md" | "docx" | "pdf";
export type TextExportFormat = Extract<ExportFormat, "txt" | "md">;

export default function exportDocumentContent(
  content: JSONContent,
  format: TextExportFormat,
): string {
  return `${renderNode(content, format).trimEnd()}\n`;
}
