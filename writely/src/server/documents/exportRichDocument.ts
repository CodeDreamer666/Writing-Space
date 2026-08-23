import type { JSONContent } from "@tiptap/core";
import { Packer } from "docx";
import createDocx from "./exportRich/createDocx";

export default function exportRichDocument(
  content: JSONContent,
  title: string,
): Promise<Buffer> {
  return Packer.toBuffer(createDocx(content, title));
}
