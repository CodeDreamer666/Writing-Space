import type { ExportFormat } from "~/server/documents/exportDocument";

const extensionLabels: Record<ExportFormat, string> = {
  txt: "txt",
  md: "md",
  docx: "docx",
};

export function createExportFilename(title: string, format: ExportFormat) {
  const safeTitle = title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/[. ]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 100);

  return `${safeTitle || "Untitled draft"}.${extensionLabels[format]}`;
}

function decodeBase64(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function downloadExport({
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
