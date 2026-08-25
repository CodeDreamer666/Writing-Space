import type { JSONContent } from "@tiptap/core";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Paragraph,
  TextRun,
} from "docx";
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
      bullet:
        block.kind === "list" && block.listType === "bullet"
          ? { level: 0 }
          : undefined,
      numbering:
        block.kind === "list" && block.listType === "ordered"
          ? { reference: "writely-ordered-list", level: 0 }
          : undefined,
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
    numbering: {
      config: [
        {
          reference: "writely-ordered-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [{ children: paragraphs }],
  });
}
