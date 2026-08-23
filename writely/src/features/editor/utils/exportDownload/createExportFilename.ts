import type { ExportFormat } from "~/server/documents/exportDocument";
import { extensionLabels } from "./constants";

export default function createExportFilename(
  title: string,
  format: ExportFormat,
) {
  const safeTitle = title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/[. ]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 100);
  return `${safeTitle || "Untitled draft"}.${extensionLabels[format]}`;
}
