import type { Editor } from "@tiptap/react";
import type { CapturedAiContext } from "~/types/ai";
import getSelectionHtml from "./getSelectionHtml";

export default function captureAiContext(editor: Editor): CapturedAiContext {
  const { from, to } = editor.state.selection;
  return {
    selectedText: editor.state.doc.textBetween(from, to, "\n\n"),
    selectedHtml: getSelectionHtml(editor, from, to),
    from,
    to,
  };
}
