"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EditorExperience from "~/components/editor/EditorExperience";
import useStatusMessage from "~/hooks/useStatusMessage";
import Loading from "~/components/shared/Loading";
import DocumentCharacterLimit from "~/features/editor/extensions/DocumentCharacterLimit";
import { MAX_DOCUMENT_CHARACTERS } from "~/lib/documentLimits";
import type { RouterOutputs } from "~/trpc/routerTypes";

type Document = RouterOutputs["docs"]["getSelectedDoc"];
export default function EditorRuntime({
    docId,
    document,
}: {
    docId: string;
    document: Document;
}) {
    const { showMessage } = useStatusMessage();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start with the sentence you cannot stop thinking about",
            }),
            DocumentCharacterLimit.configure({
                limit: MAX_DOCUMENT_CHARACTERS,
                onLimitExceeded: () => {
                    showMessage(
                        `A document can contain up to ${MAX_DOCUMENT_CHARACTERS.toLocaleString("en")} characters.`,
                        false,
                    );
                },
                onUnsupportedPictograph: () => {
                    showMessage(
                        "Emoji and decorative pictographs are not supported. Use normal punctuation, numbers, or useful symbols instead.",
                        false,
                    );
                },
            }),
        ],
        content: "<p></p>",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                "aria-label": "Draft content",
                class:
                    "min-h-[48vh] outline-none text-(--w-strong) transition-colors duration-200 focus:text-(--w-foreground)",
                role: "textbox",
            },
        },
    });

    if (!editor) {
        return <Loading />;
    }

    return <EditorExperience docId={docId} document={document} editor={editor} />;
}
