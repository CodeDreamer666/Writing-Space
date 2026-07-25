import type { Editor } from "@tiptap/react";
import { DOMSerializer } from "@tiptap/pm/model";
import type { CapturedAiContext } from "~/types/ai";

function getSelectionHtml(editor: Editor, from: number, to: number): string {
  const fragment = editor.state.doc.slice(from, to).content;
  const container = document.createElement("div");
  const serializer = DOMSerializer.fromSchema(editor.schema);

  container.appendChild(serializer.serializeFragment(fragment, { document }));

  return container.innerHTML;
}

export function captureAiContext(editor: Editor): CapturedAiContext {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "\n\n");

  return {
    selectedText,
    selectedHtml: getSelectionHtml(editor, from, to),
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
      context.selectedText &&
    getSelectionHtml(editor, context.from, context.to) === context.selectedHtml
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

  editor
    .chain()
    .focus()
    .insertContentAt({ from: context.from, to: context.to }, content)
    .run();
}
