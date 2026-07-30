"use client";
import { useEffect, useRef, useState } from "react";
import type { SaveStatus } from "../hooks/useDocumentAutosave";
import Link from "next/link";

type Props = {
    isOpen: boolean;
    saveStatus: SaveStatus;
    title: string;
    wordCount: number;
    characterCount: number;
    readingTime: string;
    isExporting: boolean;
    onOpen: () => void;
    onClose: () => void;
    onTitleChange: (title: string) => void;
    onExport: () => void;
};

function getSaveStatusLabel(status: SaveStatus) {
    if (status === "error") {
        return "Save failed";
    }

    if (status === "saved") {
        return "Saved";
    }

    if (status === "conflict") {
        return "Resolve conflict";
    }

    if (status === "recovery") {
        return "Recovery available";
    }

    if (status === "unsaved") {
        return "Unsaved changes";
    }

    return "Saving now…";
}

export default function EditorChrome({
    isOpen,
    saveStatus,
    title,
    wordCount,
    characterCount,
    readingTime,
    isExporting,
    onOpen,
    onClose,
    onTitleChange,
    onExport,
}: Props) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const titleButtonRef = useRef<HTMLButtonElement>(null);
    const originalTitleRef = useRef(title);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();

                if (isEditingTitle) {
                    event.stopImmediatePropagation();
                    onTitleChange(originalTitleRef.current);
                    setIsEditingTitle(false);
                    window.setTimeout(() => titleButtonRef.current?.focus(), 0);
                    return;
                }

                onClose();
                menuButtonRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isEditingTitle, isOpen, onClose, onTitleChange]);

    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
        }
    }, [isEditingTitle]);

    const closeAndRun = (action: () => void) => {
        setIsEditingTitle(false);
        onClose();
        action();
    };

    const closeSidebar = () => {
        setIsEditingTitle(false);
        onClose();
    };

    return (
        <>
            <button
                ref={menuButtonRef}
                type="button"
                onClick={onOpen}
                aria-label="Open document menu"
                aria-expanded={isOpen}
                aria-controls="editor-sidebar"
                className="fixed top-4 left-4 z-30 flex size-10 cursor-pointer items-center justify-center rounded-lg text-[var(--w-muted)] hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)] sm:top-5 sm:left-6"
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
            </button>

            <p
                role="status"
                className={`fixed top-6 right-4 z-30 max-w-40 truncate text-xs sm:top-7 sm:right-6 ${saveStatus === "error" ? "text-[#C96F5B]" : "text-[var(--w-subtle)]"
                    }`}
            >
                {getSaveStatusLabel(saveStatus)}
            </p>

            <button
                type="button"
                onClick={closeSidebar}
                aria-label="Close document menu"
                tabIndex={isOpen ? 0 : -1}
                className={`fixed inset-0 z-40 cursor-default bg-black/45 transition-opacity duration-[210ms] ease-out ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />
            <aside
                id="editor-sidebar"
                aria-label="Document menu"
                aria-hidden={!isOpen}
                inert={!isOpen}
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,300px)] flex-col overflow-y-auto border-r border-[var(--w-border)] bg-[var(--w-surface)] px-4 py-5 shadow-2xl transition-transform duration-[210ms] ease-out ${isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
                    }`}
            >
                <div className="flex shrink-0 items-center justify-between gap-3 px-2">
                    <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
                        Writely beta
                    </p>
                    <button
                        type="button"
                        onClick={closeSidebar}
                        aria-label="Close document menu"
                        className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-[var(--w-muted)] hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
                    >
                        ×
                    </button>
                </div>

                <div className="mt-6 shrink-0 px-2">
                    <label
                        htmlFor="title"
                        className="mb-1.5 text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase"
                    >
                        Draft title
                    </label>
                    <input
                        id="title"
                        value={title}
                        onChange={(event) => onTitleChange(event.target.value)}
                        placeholder="New Draft"
                        aria-label="Draft title"
                        maxLength={200}
                        disabled={saveStatus === "recovery"}
                        className="min-h-10 w-full bg-transparent px-0 py-1 text-left text-base leading-6 text-[var(--w-foreground)] outline-none placeholder:text-[var(--w-placeholder)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>

                <div aria-hidden="true" className="min-h-10 flex-1" />

                <section
                    aria-labelledby="writing-statistics-heading"
                    className="shrink-0 px-2 pb-5"
                >
                    <h2
                        id="writing-statistics-heading"
                        className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase"
                    >
                        Writing statistics
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-[var(--w-muted)]">Words</dt>
                            <dd className="font-medium text-[var(--w-strong)] tabular-nums">
                                {wordCount.toLocaleString("en")}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-[var(--w-muted)]">Characters</dt>
                            <dd className="font-medium text-[var(--w-strong)] tabular-nums">
                                {characterCount.toLocaleString("en")}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-[var(--w-muted)]">Reading time</dt>
                            <dd className="text-right font-medium text-[var(--w-strong)]">
                                {readingTime}
                            </dd>
                        </div>
                    </dl>
                </section>

                <nav className="shrink-0 space-y-2 px-2">
                    <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => closeAndRun(onExport)}
                        className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--w-border)] bg-[var(--w-border-soft)] px-3 text-left text-sm font-medium text-[var(--w-strong)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 3v12" />
                            <path d="m7 10 5 5 5-5" />
                            <path d="M5 21h14" />
                        </svg>
                        Export
                    </button>
                    <Link
                        href="/app"
                        className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--w-border)] bg-[var(--w-border-soft)] px-3 text-left text-sm font-medium text-[var(--w-strong)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Back to documents
                    </Link>
                </nav>
            </aside>
        </>
    );
}
