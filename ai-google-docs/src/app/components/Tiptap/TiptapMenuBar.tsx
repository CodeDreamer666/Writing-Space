import TiptapEditorButton from "./TiptapEditorButton";
import type { Editor } from "@tiptap/react";

export default function TiptapMenuBar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-1 py-3">
            <TiptapEditorButton
                active={editor.isActive("heading", { level: 1 })}
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
            >
                H1
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive("heading", { level: 2 })}
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
            >
                H2
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive('paragraph')}
                onClick={() => editor.chain().focus().setParagraph().run()}
            >
                P
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive("bulletList")}
                onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
            >
                •
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive("orderedList")}
                onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
            >
                1.
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive("bold")}
                onClick={() =>
                    editor.chain().focus().toggleBold().run()
                }
            >
                B
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive("italic")}
                onClick={() =>
                    editor.chain().focus().toggleItalic().run()
                }
            >
                I
            </TiptapEditorButton>

            <TiptapEditorButton
                active={editor.isActive("blockquote")}
                onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                }
            >
                ❝
            </TiptapEditorButton>
        </div>
    );
}