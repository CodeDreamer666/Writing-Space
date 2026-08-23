import type { JSONContent } from "@tiptap/core";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import createPdfDefinition from "./exportPdf/createPdfDefinition";

pdfMake.vfs = pdfFonts;

export default async function exportPdfDocument(
  content: JSONContent,
  title: string,
): Promise<Buffer> {
  return new Promise((resolve) => {
    pdfMake.createPdf(createPdfDefinition(content, title)).getBuffer(resolve);
  });
}
