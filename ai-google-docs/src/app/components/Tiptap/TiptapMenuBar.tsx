"use client"
import { type Editor } from "@tiptap/react";

type Props = {
    editor: Editor | null;
};

type ToolbarButton = {
    label: React.ReactNode;
    title: string;
    action: () => void;
    isActive?: boolean;
};

export default function TiptapMenuBar({ editor }: Props) {
    if (!editor) return null;

    const groups: ToolbarButton[][] = [
        [
            {
                label: <b style={{ fontWeight: 600, fontSize: 13 }}>B</b>,
                title: "Bold",
                action: () => editor.chain().focus().toggleBold().run(),
                isActive: editor.isActive("bold"),
            },
            {
                label: <i style={{ fontStyle: "italic", fontSize: 13 }}>I</i>,
                title: "Italic",
                action: () => editor.chain().focus().toggleItalic().run(),
                isActive: editor.isActive("italic"),
            },
        ],
        [
            {
                label: <span style={{ fontSize: 11, fontWeight: 600 }}>H1</span>,
                title: "Heading 1",
                action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: editor.isActive("heading", { level: 1 }),
            },
            {
                label: <span style={{ fontSize: 11, fontWeight: 600 }}>H2</span>,
                title: "Heading 2",
                action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                isActive: editor.isActive("heading", { level: 2 }),
            },
        ],
        [
            {
                label: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <circle cx="3" cy="6" r="1" fill="currentColor" />
                        <circle cx="3" cy="12" r="1" fill="currentColor" />
                        <circle cx="3" cy="18" r="1" fill="currentColor" />
                    </svg>
                ),
                title: "Bullet list",
                action: () => editor.chain().focus().toggleBulletList().run(),
                isActive: editor.isActive("bulletList"),
            },
            {
                label: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="10" y1="6" x2="21" y2="6" />
                        <line x1="10" y1="12" x2="21" y2="12" />
                        <line x1="10" y1="18" x2="21" y2="18" />
                        <text x="2" y="7" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">1.</text>
                        <text x="2" y="13" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">2.</text>
                        <text x="2" y="19" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">3.</text>
                    </svg>
                ),
                title: "Numbered list",
                action: () => editor.chain().focus().toggleOrderedList().run(),
                isActive: editor.isActive("orderedList"),
            },
            {
                label: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                    </svg>
                ),
                title: "Blockquote",
                action: () => editor.chain().focus().toggleBlockquote().run(),
                isActive: editor.isActive("blockquote"),
            },
        ],
        [
            {
                label: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4" />
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                ),
                title: "Undo",
                action: () => editor.chain().focus().undo().run(),
            },
            {
                label: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 14 20 9 15 4" />
                        <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                    </svg>
                ),
                title: "Redo",
                action: () => editor.chain().focus().redo().run(),
            },
        ],
    ];

    return (
        <div className="max-w-3xl mx-auto flex h-10 items-center gap-1 px-5">
            {groups.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                    {gi > 0 && (
                        <div className="mx-2 h-4 w-px bg-[#151A20]" />
                    )}
                    {group.map((btn, bi) => (
                        <button
                            key={bi}
                            title={btn.title}
                            onClick={btn.action}
                            className={`
                                flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors
                                ${btn.isActive
                                    ? "bg-[#1A1F26] text-[#F5F5F7]"
                                    : "text-[#3A4250] hover:bg-[#0F1318] hover:text-[#8E96A3]"
                                }
                            `}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}