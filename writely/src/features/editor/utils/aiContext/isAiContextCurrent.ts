import type { Editor } from "@tiptap/react";
import type { CapturedAiContext } from "~/types/ai";
import getSelectionHtml from "./getSelectionHtml";

export default function isAiContextCurrent(
  editor: Editor,
  context: CapturedAiContext,
): boolean {
  // The document can shrink after an edit, leaving the captured range out of bounds.
  if (context.from < 0 || context.to > editor.state.doc.content.size) {
    return false;
  }

  return (
    editor.state.doc.textBetween(context.from, context.to, "\n\n") ===
      context.selectedText &&
    getSelectionHtml(editor, context.from, context.to) === context.selectedHtml
  );
}
