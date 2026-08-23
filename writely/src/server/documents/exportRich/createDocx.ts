import type { JSONContent } from "@tiptap/core";
import { BorderStyle, Document, HeadingLevel, Paragraph, TextRun } from "docx";
import collectBlocks from "./collectBlocks";

export default function createDocx(content: JSONContent, title: string) {
  const paragraphs = collectBlocks(content).map((block) => {
    const children = block.runs.map(
      (run) =>
        new TextRun({
          text: run.text,
          bold: run.bold,
          italics: run.italic || block.kind === "blockquote",
          break: run.text === "\n" ? 1 : undefined,
        }),
    );

    if (block.marker) {
      children.unshift(new TextRun({ text: `${block.marker} ` }));
    }

    const heading =
      block.kind === "heading"
        ? block.level === 1
          ? HeadingLevel.HEADING_1
          : block.level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3
        : undefined;

    return new Paragraph({
      children,
      heading,
      indent: block.kind === "blockquote" ? { left: 360 } : undefined,
      border:
        block.kind === "blockquote"
          ? {
              left: {
                color: "AEB4BE",
                space: 8,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            }
          : undefined,
      spacing: { after: block.kind === "heading" ? 220 : 160 },
    });
  });

  return new Document({
    creator: "Writely",
    title,
    sections: [{ children: paragraphs }],
  });
}
