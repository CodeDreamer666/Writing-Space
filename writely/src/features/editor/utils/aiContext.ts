import type { Editor } from "@tiptap/react";
import type { CapturedAiContext } from "~/types/ai";
import { toEditorHtml } from "./editorContent";

function getFullDocumentText(editor: Editor): string {
  return editor.getText({ blockSeparator: "\n\n" });
}

export function captureAiContext(editor: Editor): CapturedAiContext {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "\n\n");

  if (selectedText) {
    return {
      scope: "selection",
      selectedText,
      fullDocument: getFullDocumentText(editor),
      from,
      to,
    };
  }

  return {
    scope: "document",
    fullDocument: getFullDocumentText(editor),
  };
}

export function isAiContextCurrent(
  editor: Editor,
  context: CapturedAiContext,
): boolean {
  if (context.scope === "document") {
    return getFullDocumentText(editor) === context.fullDocument;
  }

  if (context.from == null || context.to == null) {
    return false;
  }

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

  if (context.scope === "document") {
    editor.commands.setContent(html || "<p></p>");
    editor.commands.focus("end");
    return;
  }

  editor
    .chain()
    .focus()
    .insertContentAt({ from: context.from!, to: context.to! }, html)
    .run();
}
