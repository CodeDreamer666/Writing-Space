"use client"
import { EditorContent, useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Button from './EditorButton';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-1 py-3">
            <Button
                active={editor.isActive("heading", { level: 1 })}
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
            >
                H1
            </Button>

            <Button
                active={editor.isActive("heading", { level: 2 })}
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
            >
                H2
            </Button>

            <Button
                active={editor.isActive('paragraph')}
                onClick={() => editor.chain().focus().setParagraph().run()}
            >
                P
            </Button>

            <Button
                active={editor.isActive("bulletList")}
                onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
            >
                •
            </Button>

            <Button
                active={editor.isActive("orderedList")}
                onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
            >
                1.
            </Button>

            <Button
                active={editor.isActive("bold")}
                onClick={() =>
                    editor.chain().focus().toggleBold().run()
                }
            >
                B
            </Button>

            <Button
                active={editor.isActive("italic")}
                onClick={() =>
                    editor.chain().focus().toggleItalic().run()
                }
            >
                I
            </Button>

            <Button
                active={editor.isActive("blockquote")}
                onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                }
            >
                ❝
            </Button>
        </div>
    );
};
const Tiptap = () => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: "<textarea></textarea>",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `min-h-[70vh] outline-none text-lg leading-9`,
            },
        },
    });

    return (
        <>
            <MenuBar editor={editor} />
            <div className="h-px bg-[#1A1F26]" />
            <EditorContent
                editor={editor}
                className="py-2"
            />
        </>
    );
}

export default Tiptap