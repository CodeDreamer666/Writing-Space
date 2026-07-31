"use client";
import { type Editor } from "@tiptap/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const TOOLBAR_BUTTON_WIDTH = 40;
const TOOLBAR_BUTTON_GAP = 4;
const TOOLBAR_HORIZONTAL_PADDING = 8;
const TOOLBAR_ACTION_COUNT = 5;
const TOOLBAR_HEIGHT = 50;
const TOOLBAR_OFFSET = 8;
const VIEWPORT_PADDING = 8;

type Props = {
    editor: Editor | null;
    aiEnabled: boolean;
    onAiOpen: () => void;
};

type ToolbarButton = {
    label: ReactNode;
    title: string;
    action: () => void;
    isActive?: boolean;
};

export default function TiptapMenuBar({ editor, aiEnabled, onAiOpen }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0 });
    const dismissedSelectionRef = useRef<string | null>(null);
    const toolbarActionCount = TOOLBAR_ACTION_COUNT + (aiEnabled ? 1 : 0);
    const toolbarWidth =
        toolbarActionCount * TOOLBAR_BUTTON_WIDTH +
        (toolbarActionCount - 1) * TOOLBAR_BUTTON_GAP +
        TOOLBAR_HORIZONTAL_PADDING;

    useEffect(() => {
        if (!editor) {
            return;
        }

        const updateToolbar = () => {
            const { selection } = editor.state;

            if (selection.empty) {
                dismissedSelectionRef.current = null;
                setIsVisible(false);
                return;
            }

            const selectionKey = `${selection.from}:${selection.to}`;

            if (dismissedSelectionRef.current === selectionKey) {
                setIsVisible(false);
                return;
            }

            dismissedSelectionRef.current = null;

            try {
                const from = Math.min(selection.from, selection.to);
                const to = Math.max(selection.from, selection.to);
                const fromCoords = editor.view.coordsAtPos(from);
                const toCoords = editor.view.coordsAtPos(to);
                const selectionMiddle = (fromCoords.left + toCoords.right) / 2;
                const minLeft = VIEWPORT_PADDING + toolbarWidth / 2;
                const maxLeft = window.innerWidth - VIEWPORT_PADDING - toolbarWidth / 2;
                const left = Math.min(Math.max(selectionMiddle, minLeft), maxLeft);
                const top = Math.max(
                    VIEWPORT_PADDING,
                    Math.min(fromCoords.top, toCoords.top) -
                    TOOLBAR_HEIGHT -
                    TOOLBAR_OFFSET,
                );

                setPosition({ left: left - toolbarWidth / 2, top });
                setIsVisible(true);
            } catch {
                setIsVisible(false);
            }
        };

        updateToolbar();
        editor.on("selectionUpdate", updateToolbar);
        editor.on("transaction", updateToolbar);
        editor.on("blur", updateToolbar);
        window.addEventListener("resize", updateToolbar);
        window.addEventListener("scroll", updateToolbar, true);

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                const { from, to } = editor.state.selection;
                dismissedSelectionRef.current = `${from}:${to}`;
                setIsVisible(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            editor.off("selectionUpdate", updateToolbar);
            editor.off("transaction", updateToolbar);
            editor.off("blur", updateToolbar);
            window.removeEventListener("resize", updateToolbar);
            window.removeEventListener("scroll", updateToolbar, true);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [editor, toolbarWidth]);

    if (!editor) {
        return null;
    }

    const buttons: ToolbarButton[] = [
        {
            label: <b className="text-[13px] font-semibold">B</b>,
            title: "Bold",
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive("bold"),
        },
        {
            label: <i className="text-[13px] italic">I</i>,
            title: "Italic",
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive("italic"),
        },
        {
            label: <span className="text-[13px] font-semibold">H</span>,
            title: "Heading 2",
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive("heading", { level: 2 }),
        },
        {
            label: <span className="text-base leading-none">≡</span>,
            title: "Bullet list",
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive("bulletList"),
        },
        {
            label: (
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
            ),
            title: "Quote",
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive("blockquote"),
        },
    ];

    if (aiEnabled) {
        buttons.push({
            label: <span className="text-[11px] font-semibold">AI</span>,
            title: "Ask AI",
            action: onAiOpen,
        });
    }

    return (
        <div
            className={`pointer-events-none fixed z-50 transition-all duration-200 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                }`}
            style={{
                left: position.left,
                top: position.top,
                width: toolbarWidth,
            }}
            aria-hidden={!isVisible}
            inert={!isVisible}
        >
            <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-(--w-border) bg-(--w-surface-raised)/95 p-1 shadow-2xl backdrop-blur-xl">
                {buttons.map((button) => (
                    <button
                        key={button.title}
                        type="button"
                        title={button.title}
                        aria-label={button.title}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={button.action}
                        className={`flex size-10 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--w-muted) active:scale-95 ${button.isActive
                                ? "bg-(--w-foreground) text-(--w-background)"
                                : "text-(--w-muted) hover:bg-(--w-border-soft) hover:text-(--w-foreground)"
                            }`}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
