import type { JSONContent } from "@tiptap/core";
import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

type StyledRun = {
  text: string;
  bold: boolean;
  italic: boolean;
};

type ContentBlock = {
  kind: "paragraph" | "heading" | "list" | "blockquote";
  level?: number;
  marker?: string;
  runs: StyledRun[];
};

function collectRuns(node: JSONContent): StyledRun[] {
  if (node.type === "text") {
    const marks = node.marks ?? [];

    return [
      {
        text: node.text ?? "",
        bold: marks.some((mark) => mark.type === "bold"),
        italic: marks.some((mark) => mark.type === "italic"),
      },
    ];
  }

  if (node.type === "hardBreak") {
    return [{ text: "\n", bold: false, italic: false }];
  }

  return (node.content ?? []).flatMap(collectRuns);
}

function collectBlocks(content: JSONContent): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const visit = (node: JSONContent) => {
    if (node.type === "heading") {
      blocks.push({
        kind: "heading",
        level: Number(node.attrs?.level) || 1,
        runs: collectRuns(node),
      });
      return;
    }

    if (node.type === "paragraph") {
      blocks.push({ kind: "paragraph", runs: collectRuns(node) });
      return;
    }

    if (node.type === "bulletList" || node.type === "orderedList") {
      const start = Number(node.attrs?.start ?? 1);

      for (const [index, item] of (node.content ?? []).entries()) {
        blocks.push({
          kind: "list",
          marker: node.type === "orderedList" ? `${start + index}.` : "•",
          runs: collectRuns(item),
        });
      }
      return;
    }

    if (node.type === "blockquote") {
      for (const child of node.content ?? []) {
        blocks.push({
          kind: "blockquote",
          runs: collectRuns(child),
        });
      }
      return;
    }

    for (const child of node.content ?? []) {
      visit(child);
    }
  };

  visit(content);
  return blocks;
}

function createDocx(content: JSONContent, title: string) {
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

export function exportRichDocument(
  content: JSONContent,
  title: string,
): Promise<Buffer> {
  return Packer.toBuffer(createDocx(content, title));
}
