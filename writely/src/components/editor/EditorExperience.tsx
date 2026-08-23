"use client";
import { type Editor, EditorContent } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AiWritingPanel from "~/components/editor/AiWritingPanel";
import Loading from "~/components/shared/Loading";
import SaveStatusNotice from "~/components/editor/SaveStatusNotice";
import TiptapMenuBar from "~/components/editor/TiptapMenuBar";
import useStatusMessage from "~/hooks/useStatusMessage";
import useDocumentAutosave, {
    type SaveStatus,
} from "~/features/editor/hooks/useDocumentAutosave";
import readingTime from "~/features/editor/utils/editorContent/readingTime";
import downloadExport from "~/features/editor/utils/exportDownload/downloadExport";
import isWritingMode from "~/features/editor/utils/isWritingMode";
import useWritingAppearance from "~/hooks/useWritingAppearance";
import useHandleTRPCError from "~/trpc/useHandleTRPCError";
import countUnsupportedPictographs from "~/lib/countUnsupportedPictographs";
import {
    WRITING_EDITOR_WIDTH_PIXELS,
    WRITING_FONT_FAMILY_VALUES,
    WRITING_LINE_HEIGHTS,
    WRITING_TEXT_SIZE_PIXELS,
} from "~/lib/writingAppearance";
import type { ExportFormat } from "~/server/documents/exportDocument";
import api from "~/trpc/api";
import type { RouterOutputs } from "~/trpc/routerTypes";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

const formats: Array<{ format: ExportFormat; label: string }> = [
    { format: "txt", label: "TXT" },
    { format: "md", label: "Markdown" },
    { format: "docx", label: "Word" },
    { format: "pdf", label: "PDF" },
];

export default function EditorExperience({
    docId,
    document,
    editor,
}: {
    docId: string;
    document: Document;
    editor: Editor;
}) {
    const router = useRouter();
    const handleTRPCError = useHandleTRPCError();
    const { showMessage } = useStatusMessage();
    const { appearance } = useWritingAppearance();
    const [title, setTitle] = useState(document.title);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: aiStatus, error: aiStatusError } = api.ai.getStatus.useQuery(
        undefined,
        {
            retry: false,
            refetchOnWindowFocus: true,
        },
    );
    const aiEnabled = aiStatus?.enabled ?? false;
    const aiMessage =
        aiStatus?.message ??
        (aiStatusError
            ? "Writely AI is unavailable right now. You can keep writing and saving normally."
            : "Checking AI availability…");

    const handleSaveError = useCallback(
        (error: unknown) => {
            handleTRPCError({ error, router });
        },
        [handleTRPCError, router],
    );

    const {
        discardRecovery,
        handleTitleChange,
        isHydrated,
        openSavedVersion,
        restoreRecovery,
        savePendingChanges,
        saveStatus,
    } = useDocumentAutosave({
        docId,
        document,
        editor,
        title,
        setTitle,
        onWordCountChange: setWordCount,
        onError: handleSaveError,
    });

    useEffect(() => {
        editor.setEditable(saveStatus !== "recovery");
    }, [editor, saveStatus]);

    useEffect(() => {
        const updateCharacterCount = () => {
            setCharacterCount(editor.state.doc.textContent.length);
        };

        updateCharacterCount();
        editor.on("transaction", updateCharacterCount);

        return () => {
            editor.off("transaction", updateCharacterCount);
        };
    }, [editor]);

    const exportDocument = api.docs.exportDoc.useMutation({
        onSuccess: (newData) => {
            downloadExport(newData);
        },

        onError: (error) => {
            handleTRPCError({ error, router });
        },
    });

    const handleValidatedTitleChange = (nextTitle: string) => {
        if (
            countUnsupportedPictographs(nextTitle) >
            countUnsupportedPictographs(title)
        ) {
            showMessage(
                "Emoji and decorative pictographs are not supported. Use normal punctuation, numbers, or useful symbols instead.",
                false,
            );
            return;
        }

        handleTitleChange(nextTitle);
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

    if (!isHydrated) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-(--w-background) text-(--w-foreground) transition-colors duration-300">
            <div className="w-full">
                <header className="fixed inset-x-0 top-0 z-30 flex h-[71px] items-center justify-between border-b border-(--w-border-soft) bg-(--w-background) px-5 sm:px-7">
                    <button
                        type="button"
                        onClick={() => {
                            setIsAiOpen(false);
                            setIsMenuOpen(true);
                        }}
                        aria-label="Open document menu"
                        aria-expanded={isMenuOpen}
                        aria-controls="editor-sidebar"
                        className="flex size-[34px] cursor-pointer flex-col justify-center gap-1 border-0 bg-transparent p-0"
                    >
                        <span className="h-px w-full bg-current" />
                        <span className="h-px w-full bg-current" />
                        <span className="h-px w-full bg-current" />
                    </button>
                    <p
                        role="status"
                        className={`font-mono-label max-w-44 truncate text-[10px] tracking-[0.2em] uppercase ${saveStatus === "error" ? "text-(--w-foreground)" : "text-(--w-subtle)"}`}
                    >
                        {getSaveStatusLabel(saveStatus)}
                    </p>
                </header>

                <div
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close document menu"
                    className={`fixed inset-0 z-40 cursor-default bg-black/80 transition-opacity duration-210 ease-out ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
                />

                <aside
                    id="editor-sidebar"
                    aria-label="Document menu"
                    aria-hidden={!isMenuOpen}
                    className={`fixed inset-y-0 left-0 z-50 flex w-[min(88vw,320px)] flex-col overflow-y-auto border-r border-(--w-foreground) bg-(--w-background) transition-transform duration-210 ease-out ${isMenuOpen
                            ? "translate-x-0"
                            : "pointer-events-none -translate-x-full"
                        }`}
                >
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-(--w-border-soft) px-6 py-5">
                        <p className="font-mono-label text-[10px] tracking-[0.24em] text-(--w-subtle) uppercase">
                            Writely beta
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close document menu"
                            className="cursor-pointer border-0 bg-transparent p-0 text-base text-(--w-muted) hover:text-(--w-foreground)"
                        >
                            ×
                        </button>
                    </div>

                    <section className="shrink-0 border-b border-(--w-border-soft) px-6 py-7">
                        <label
                            htmlFor="title"
                            className="font-mono-label mb-[18px] block text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase"
                        >
                            Draft title
                        </label>
                        <input
                            id="title"
                            value={title}
                            onChange={(event) =>
                                handleValidatedTitleChange(event.target.value)
                            }
                            placeholder="New Draft"
                            aria-label="Draft title"
                            maxLength={200}
                            disabled={saveStatus === "recovery"}
                            className="font-display w-full appearance-none bg-transparent px-0 pb-2 text-2xl leading-[1.1] font-normal tracking-[-0.02em] text-(--w-foreground) outline-none placeholder:text-(--w-placeholder) disabled:opacity-60"
                        />
                    </section>

                    <div aria-hidden="true" className="min-h-10 flex-1" />

                    <section
                        aria-labelledby="writing-statistics-heading"
                        className="shrink-0 border-b border-(--w-border-soft) px-6 py-7"
                    >
                        <h2
                            id="writing-statistics-heading"
                            className="font-mono-label text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase"
                        >
                            Writing statistics
                        </h2>
                        <dl className="mt-5 space-y-3.5 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-(--w-muted)">Words</dt>
                                <dd className="font-mono-label text-sm tabular-nums">
                                    {wordCount.toLocaleString("en")}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-(--w-muted)">Characters</dt>
                                <dd className="font-mono-label text-sm tabular-nums">
                                    {characterCount.toLocaleString("en")}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-(--w-muted)">Reading time</dt>
                                <dd className="font-mono-label text-right text-sm">
                                    {readingTime(wordCount)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="flex flex-col border-t border-(--w-border-soft)">
                        <button
                            type="button"
                            onClick={() => {
                                setIsExportOpen(true);
                            }}
                            className={[
                                "h-[58px] w-full cursor-pointer border-0 border-b border-(--w-border-soft)",
                                "bg-transparent px-6 text-left text-sm font-medium",
                                "hover:bg-(--w-foreground) hover:text-(--w-background)",
                            ].join(" ")}
                        >
                            <svg
                                className="mr-2.5 inline"
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
                            className={[
                                "flex h-[58px] w-full cursor-pointer items-center bg-transparent px-6 text-left",
                                "text-sm text-(--w-muted) hover:bg-(--w-surface-raised) hover:text-(--w-foreground)",
                            ].join(" ")}
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
                    </section>
                </aside>

                <main
                    data-writely-editor
                    className="writely-editor min-w-0 px-5 pt-[118px] pb-32 sm:px-8 sm:pt-[132px] sm:pb-40"
                >
                    <div
                        className="mx-auto w-full"
                        style={{
                            maxWidth: WRITING_EDITOR_WIDTH_PIXELS[appearance.editorWidth],
                        }}
                    >
                        <section className="relative">
                            <SaveStatusNotice
                                status={saveStatus}
                                onRetry={() => void savePendingChanges()}
                                onOpenSavedVersion={openSavedVersion}
                                onRestoreRecovery={restoreRecovery}
                                onDiscardRecovery={discardRecovery}
                            />

                            <div
                                style={{
                                    fontFamily: WRITING_FONT_FAMILY_VALUES[appearance.fontFamily],
                                    fontSize: WRITING_TEXT_SIZE_PIXELS[appearance.textSize],
                                    lineHeight: WRITING_LINE_HEIGHTS[appearance.lineSpacing],
                                }}
                            >
                                <EditorContent editor={editor} />
                            </div>

                            <TiptapMenuBar
                                editor={editor}
                                aiEnabled={aiEnabled}
                                onAiOpen={() => {
                                    setIsMenuOpen(false);
                                    setIsAiOpen(true);
                                }}
                            />
                        </section>
                    </div>
                </main>

                <AiWritingPanel
                    docId={docId}
                    isOpen={isAiOpen}
                    editor={editor}
                    initialMode={
                        isWritingMode(document.writingMode) ? document.writingMode : "Clear"
                    }
                    aiEnabled={aiEnabled}
                    aiMessage={aiMessage}
                    remainingTokens={aiStatus?.remainingTokens ?? 0}
                    onClose={() => setIsAiOpen(false)}
                />

                {isExportOpen && (
                    <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5">
                        <div
                            aria-label="Close export dialog"
                            onClick={() => setIsExportOpen(false)}
                            className="absolute inset-0 cursor-default"
                        />

                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="export-title"
                            className="relative w-full max-w-[480px] border border-(--w-foreground) bg-(--w-background)"
                        >
                            <div className="flex items-start justify-between gap-5 px-[26px] pt-[26px] pb-[22px]">
                                <div>
                                    <p className="font-mono-label text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase">
                                        Current document
                                    </p>
                                    <h2
                                        id="export-title"
                                        className="font-display mt-3 text-2xl font-normal text-(--w-foreground)"
                                    >
                                        Export your writing
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => setIsExportOpen(false)}
                                    aria-label="Close export dialog"
                                    className="cursor-pointer border-0 bg-transparent p-0 text-base text-(--w-muted) hover:text-(--w-foreground)"
                                >
                                    ×
                                </button>
                            </div>

                            <ul className="grid grid-cols-2 border-t border-(--w-border-soft)">
                                {formats.map(({ format, label }) => (
                                    <li className="flex w-full" key={format}>
                                        <button
                                            type="button"
                                            disabled={exportDocument.isPending}
                                            onClick={() => exportDocument.mutate({ docId, format })}
                                            className={[
                                                "block h-[68px] w-full cursor-pointer border-0 border-r border-b border-(--w-border-soft)",
                                                "bg-(--w-background) px-[22px] text-left text-sm font-medium",
                                                "text-(--w-foreground) hover:bg-(--w-foreground) hover:text-(--w-background) disabled:cursor-wait disabled:opacity-60",
                                            ].join(" ")}
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <p className="px-[26px] pt-[18px] pb-6 text-xs leading-[1.7] text-(--w-subtle)">
                                Headings, lists, bold, italic, and line breaks are preserved
                                where the format supports them. PDF uses embedded
                                Unicode-compatible fonts. Writely 2.0 guarantees reliable PDF
                                export for English only.
                            </p>
                        </section>
                    </section>
                )}
            </div>
        </div>
    );
}
