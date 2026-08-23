import type { ExportFormat } from "~/server/documents/exportDocument";
import createExportFilename from "./createExportFilename";
import decodeBase64 from "./decodeBase64";

export default function downloadExport({
  title,
  content,
  encoding,
  format,
  mimeType,
}: {
  title: string;
  content: string;
  encoding: "utf8" | "base64";
  format: ExportFormat;
  mimeType: string;
}) {
  const body = encoding === "base64" ? decodeBase64(content) : content;
  const blob = new Blob([body], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = createExportFilename(title, format);
  link.click();
  URL.revokeObjectURL(url);
}
