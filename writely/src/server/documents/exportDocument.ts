import type { JSONContent } from "@tiptap/core";

export type ExportFormat = "txt" | "md" | "pdf" | "docx";
export type TextExportFormat = Extract<ExportFormat, "txt" | "md">;

function children(node: JSONContent, format: TextExportFormat): string {
  return (node.content ?? [])
    .map((child) => renderNode(child, format))
    .join("");
}

function renderNode(node: JSONContent, format: TextExportFormat): string {
  if (node.type === "text") {
    let text = node.text ?? "";

    if (format === "md") {
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") {
          text = `**${text}**`;
        } else if (mark.type === "italic") {
          text = `*${text}*`;
        } else if (mark.type === "code") {
          text = `\`${text}\``;
        }
      }
    }

    return text;
  }

  const content = children(node, format);

  switch (node.type) {
    case "doc":
      return content.trimEnd();
    case "paragraph":
      return `${content}\n\n`;
    case "heading":
      return format === "md"
        ? `${"#".repeat(Number(node.attrs?.level) || 1)} ${content}\n\n`
        : `${content}\n\n`;
    case "bulletList":
      return `${(node.content ?? [])
        .map((item) => `- ${children(item, format).trim()}\n`)
        .join("")}\n`;
    case "orderedList":
      return `${(node.content ?? [])
        .map(
          (item, index) =>
            `${Number(node.attrs?.start ?? 1) + index}. ${children(item, format).trim()}\n`,
        )
        .join("")}\n`;
    case "listItem":
      return content;
    case "blockquote":
      return format === "md"
        ? `${content
            .trim()
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")}\n\n`
        : `${content.trim()}\n\n`;
    case "hardBreak":
      return "\n";
    case "horizontalRule":
      return format === "md" ? "\n---\n\n" : "\n";
    default:
      return content;
  }
}

export function exportDocumentContent(
  content: JSONContent,
  format: TextExportFormat,
): string {
  return `${renderNode(content, format).trimEnd()}\n`;
}

export function isDocumentEmpty(content: JSONContent): boolean {
  return exportDocumentContent(content, "txt").trim().length === 0;
}
