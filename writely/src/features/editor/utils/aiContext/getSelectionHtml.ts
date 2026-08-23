import type { Editor } from "@tiptap/react";
import { DOMSerializer } from "@tiptap/pm/model";

export default function getSelectionHtml(
  editor: Editor,
  from: number,
  to: number,
): string {
  const fragment = editor.state.doc.slice(from, to).content;
  const container = document.createElement("div");
  const serializer = DOMSerializer.fromSchema(editor.schema);
  container.appendChild(serializer.serializeFragment(fragment, { document }));
  return container.innerHTML;
}
