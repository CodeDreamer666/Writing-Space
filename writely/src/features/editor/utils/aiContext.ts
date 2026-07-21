import type { Editor } from "@tiptap/react";
import type { CapturedAiContext } from "~/types/ai";
import { toEditorHtml } from "./editorContent";

export function captureAiContext(editor: Editor): CapturedAiContext {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "\n\n");

  return {
    selectedText,
    from,
    to,
  };
}

export function isAiContextCurrent(
  editor: Editor,
  context: CapturedAiContext,
): boolean {
  return (
    editor.state.doc.textBetween(context.from, context.to, "\n\n") ===
    context.selectedText
  );
}

export function replaceAiContext(
  editor: Editor,
  context: CapturedAiContext,
  content: string,
): void {
  if (!isAiContextCurrent(editor, context)) {
    return;
  }

  const html = toEditorHtml(content);

  editor
    .chain()
    .focus()
    .insertContentAt({ from: context.from, to: context.to }, html)
    .run();
}
