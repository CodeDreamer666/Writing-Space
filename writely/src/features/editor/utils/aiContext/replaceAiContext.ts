import type { Editor } from "@tiptap/react";
import type { CapturedAiContext } from "~/types/ai";
import isAiContextCurrent from "./isAiContextCurrent";

export default function replaceAiContext(
  editor: Editor,
  context: CapturedAiContext,
  content: string,
): void {
  if (!isAiContextCurrent(editor, context)) return;
  editor
    .chain()
    .focus()
    .insertContentAt({ from: context.from, to: context.to }, content)
    .run();
}
