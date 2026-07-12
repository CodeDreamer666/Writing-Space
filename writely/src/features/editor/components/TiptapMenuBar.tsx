"use client";

import { type Editor } from "@tiptap/react";
import { useEffect, useState, type ReactNode } from "react";

const TOOLBAR_WIDTH = 156;
const TOOLBAR_HEIGHT = 42;
const TOOLBAR_OFFSET = 8;
const VIEWPORT_PADDING = 8;

type Props = {
  editor: Editor | null;
  onAiOpen: () => void;
};

type ToolbarButton = {
  label: ReactNode;
  title: string;
  action: () => void;
  isActive?: boolean;
};

export default function TiptapMenuBar({ editor, onAiOpen }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateToolbar = () => {
      const { selection } = editor.state;

      if (selection.empty) {
        setIsVisible(false);
        return;
      }

      try {
        const from = Math.min(selection.from, selection.to);
        const to = Math.max(selection.from, selection.to);
        const fromCoords = editor.view.coordsAtPos(from);
        const toCoords = editor.view.coordsAtPos(to);
        const selectionMiddle = (fromCoords.left + toCoords.right) / 2;
        const minLeft = VIEWPORT_PADDING + TOOLBAR_WIDTH / 2;
        const maxLeft =
          window.innerWidth - VIEWPORT_PADDING - TOOLBAR_WIDTH / 2;
        const left = Math.min(Math.max(selectionMiddle, minLeft), maxLeft);
        const top = Math.max(
          VIEWPORT_PADDING,
          Math.min(fromCoords.top, toCoords.top) -
            TOOLBAR_HEIGHT -
            TOOLBAR_OFFSET,
        );

        setPosition({ left: left - TOOLBAR_WIDTH / 2, top });
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

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("transaction", updateToolbar);
      editor.off("blur", updateToolbar);
      window.removeEventListener("resize", updateToolbar);
      window.removeEventListener("scroll", updateToolbar, true);
    };
  }, [editor]);

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
    {
      label: <span className="text-[11px] font-semibold">AI</span>,
      title: "Ask AI",
      action: onAiOpen,
    },
  ];

  return (
    <div
      className={`pointer-events-none fixed z-50 transition-all duration-200 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
      }`}
      style={{
        left: position.left,
        top: position.top,
        width: TOOLBAR_WIDTH,
      }}
      aria-hidden={!isVisible}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-[#2E3643] bg-[#121820]/95 p-1 shadow-2xl backdrop-blur-xl">
        {buttons.map((button) => (
          <button
            key={button.title}
            title={button.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={button.action}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
              button.isActive
                ? "bg-[#F5F5F7] text-[#0B0D10]"
                : "text-[#8E96A3] hover:bg-[#1E2530] hover:text-[#F5F5F7]"
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
