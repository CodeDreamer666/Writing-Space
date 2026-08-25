import { expect, test } from "vitest";
import collectBlocks from "./collectBlocks";

export default function collectBlocksTest() {
  expect(
    collectBlocks({
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "One" }] }],
        },
      ],
    }),
  ).toEqual([
    {
      kind: "list",
      listType: "bullet",
      runs: [{ text: "One", bold: false, italic: false }],
    },
  ]);
}

test("keeps list semantics for DOCX export", collectBlocksTest);
