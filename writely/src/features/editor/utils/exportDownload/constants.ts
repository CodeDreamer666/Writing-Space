import type { ExportFormat } from "~/server/documents/exportDocument";

export const extensionLabels: Record<ExportFormat, string> = {
  txt: "txt",
  md: "md",
  docx: "docx",
  pdf: "pdf",
};
