import type { JSONContent } from "@tiptap/core";
import type { TextExportFormat } from "../exportDocument";
import renderNode from "./renderNode";

export default function children(
  node: JSONContent,
  format: TextExportFormat,
): string {
  return (node.content ?? [])
    .map((child) => renderNode(child, format))
    .join("");
}
