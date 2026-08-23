import type { JSONContent } from "@tiptap/core";
import type { ContentBlock } from "../exportRichTypes";
import collectRuns from "./collectRuns";

export default function collectBlocks(content: JSONContent): ContentBlock[] {
  if (content.type === "heading") {
    return [
      {
        kind: "heading",
        level: Number(content.attrs?.level) || 1,
        runs: collectRuns(content),
      },
    ];
  }

  if (content.type === "paragraph") {
    return [{ kind: "paragraph", runs: collectRuns(content) }];
  }

  if (content.type === "bulletList" || content.type === "orderedList") {
    const start = Number(content.attrs?.start ?? 1);

    return (content.content ?? []).map((item, index) => ({
      kind: "list",
      marker: content.type === "orderedList" ? `${start + index}.` : "•",
      runs: collectRuns(item),
    }));
  }

  if (content.type === "blockquote") {
    return (content.content ?? []).map((child) => ({
      kind: "blockquote",
      runs: collectRuns(child),
    }));
  }

  return (content.content ?? []).flatMap(collectBlocks);
}
