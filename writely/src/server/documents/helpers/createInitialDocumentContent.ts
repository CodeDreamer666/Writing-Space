import { emptyDocumentContent } from "../support";

export default function createInitialDocumentContent(
  initialText: string | undefined,
) {
  if (!initialText) {
    return emptyDocumentContent;
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: initialText }],
      },
    ],
  };
}
