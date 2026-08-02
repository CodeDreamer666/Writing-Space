"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import Loading from "~/components/shared/Loading";
import ServerError from "~/components/shared/ServerError";
import { MAX_DOCUMENT_CHARACTERS } from "~/lib/documentLimits";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { countUnsupportedPictographs } from "~/lib/writingLanguage";
import { useWritingAppearance } from "~/hooks/useWritingAppearance";
import {
    WRITING_EDITOR_WIDTH_PIXELS,
    WRITING_FONT_FAMILY_VALUES,
    WRITING_LINE_HEIGHTS,
    WRITING_TEXT_SIZE_PIXELS,
} from "~/lib/writingAppearance";
import type { ExportFormat } from "~/server/documents/exportDocument";
import { api, type RouterOutputs } from "~/trpc/react";
import { WRITING_MODES, type WritingMode } from "~/types/writing";
import { useDocumentAutosave } from "../hooks/useDocumentAutosave";
import { DocumentCharacterLimit } from "../extensions/DocumentCharacterLimit";
import { readingTime } from "../utils/editorContent";
import { downloadExport } from "../utils/exportDownload";
import AiWritingPanel from "./AiWritingPanel";
import SaveStatusNotice from "./SaveStatusNotice";
import TiptapMenuBar from "./TiptapMenuBar";
import type { SaveStatus } from "../hooks/useDocumentAutosave";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

const formats: Array<{
    format: ExportFormat;
    label: string;
}> = [
        {
            format: "txt",
            label: "TXT"
        },
        {
            format: "md",
            label: "Markdown"
        },
        {
            format: "docx",
            label: "Word",
        },
        {
            format: "pdf",
            label: "PDF",
        },
    ];

function isWritingMode(value: string): value is WritingMode {
    return WRITING_MODES.includes(value as WritingMode);
}

function EditorRuntime({
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

function EditorExperience({
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
        }
    })

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
                <button
                    type="button"
                    onClick={() => {
                        setIsAiOpen(false);
                        setIsMenuOpen(true);
                    }}
                    aria-label="Open document menu"
                    aria-expanded={isMenuOpen}
                    aria-controls="editor-sidebar"
                    className={[
                        "fixed top-4 left-4 z-30",
                        "flex size-10 cursor-pointer items-center",
                        "justify-center rounded-lg text-(--w-muted) hover:bg-(--w-surface-raised)",
                        "hover:text-(--w-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--w-muted)",
                        "sm:top-5 sm:left-6",
                    ].join(" ")}
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
                    className={`fixed top-6 right-4 z-30 max-w-40 truncate text-xs sm:top-7 sm:right-6 ${saveStatus === "error" ? "text-[#C96F5B]" : "text-(--w-subtle)"
                        }`}
                >
                    {getSaveStatusLabel(saveStatus)}
                </p>

                <div
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close document menu"
                    className={`fixed inset-0 z-40 cursor-default bg-black/45 transition-opacity duration-210 ease-out ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
                />

                <aside
                    id="editor-sidebar"
                    aria-label="Document menu"
                    aria-hidden={!isMenuOpen}
                    className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,300px)] flex-col overflow-y-auto border-r border-(--w-border) bg-(--w-surface) px-4 py-5 shadow-2xl transition-transform duration-210 ease-out ${isMenuOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
                        }`}
                >
                    <div className="flex shrink-0 items-center justify-between gap-3 px-2">
                        <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                            Writely beta
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close document menu"
                            className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-(--w-muted) hover:bg-(--w-surface-raised) hover:text-(--w-foreground)"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mt-6 shrink-0 px-2">
                        <label
                            htmlFor="title"
                            className="mb-1.5 text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase"
                        >
                            Draft title
                        </label>
                        <input
                            id="title"
                            value={title}
                            onChange={(event) => handleValidatedTitleChange(event.target.value)}
                            placeholder="New Draft"
                            aria-label="Draft title"
                            maxLength={200}
                            disabled={saveStatus === "recovery"}
                            className={[
                                "min-h-10 w-full appearance-none border-0!",
                                "bg-transparent px-0 py-1 text-left",
                                "text-base leading-6 text-(--w-foreground) shadow-none!",
                                "ring-0! outline-none! placeholder:text-(--w-placeholder) focus:border-0!",
                                "focus:shadow-none! focus:ring-0! focus:outline-none! disabled:cursor-not-allowed",
                                "disabled:opacity-60",
                            ].join(" ")}
                        />
                    </div>

                    <div aria-hidden="true" className="min-h-10 flex-1" />

                    <section
                        aria-labelledby="writing-statistics-heading"
                        className="shrink-0 px-2 pb-5"
                    >
                        <h2
                            id="writing-statistics-heading"
                            className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase"
                        >
                            Writing statistics
                        </h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-(--w-muted)">Words</dt>
                                <dd className="font-medium text-(--w-strong) tabular-nums">
                                    {wordCount.toLocaleString("en")}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-(--w-muted)">Characters</dt>
                                <dd className="font-medium text-(--w-strong) tabular-nums">
                                    {characterCount.toLocaleString("en")}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-(--w-muted)">Reading time</dt>
                                <dd className="text-right font-medium text-(--w-strong)">
                                    {readingTime(wordCount)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsExportOpen(true)
                            }}
                            className={[
                                "flex min-h-11 w-full cursor-pointer",
                                "items-center gap-2.5 rounded-lg border",
                                "border-(--w-border) bg-(--w-border-soft) px-3 text-left",
                                "text-sm font-medium text-(--w-strong) transition-colors",
                                "hover:bg-(--w-surface-raised) hover:text-(--w-foreground) focus-visible:outline-2 focus-visible:outline-offset-2",
                                "focus-visible:outline-(--w-muted)",
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
                                <path d="M12 3v12" />
                                <path d="m7 10 5 5 5-5" />
                                <path d="M5 21h14" />
                            </svg>
                            Export
                        </button>
                        <Link
                            href="/app"
                            className={[
                                "flex min-h-11 w-full cursor-pointer",
                                "items-center gap-2.5 rounded-lg border",
                                "border-(--w-border) bg-(--w-border-soft) px-3 text-left",
                                "text-sm font-medium text-(--w-strong) transition-colors",
                                "hover:bg-(--w-surface-raised) hover:text-(--w-foreground) focus-visible:outline-2 focus-visible:outline-offset-2",
                                "focus-visible:outline-(--w-muted)",
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
                    className="min-w-0 px-5 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12"
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
                    <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                        <div
                            aria-label="Close export dialog"
                            onClick={() => setIsExportOpen(false)}
                            className="absolute inset-0 cursor-default"
                        />

                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="export-title"
                            className="relative w-full max-w-md rounded-2xl border border-(--w-border) bg-(--w-surface) p-5 shadow-2xl sm:p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                                        Current document
                                    </p>
                                    <h2
                                        id="export-title"
                                        className="mt-2 text-xl font-medium text-(--w-foreground)"
                                    >
                                        Export your writing
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => setIsExportOpen(false)}
                                    aria-label="Close export dialog"
                                    className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-(--w-muted) hover:bg-(--w-surface-raised) hover:text-(--w-foreground)"
                                >
                                    ×
                                </button>
                            </div>

                            <ul className="mt-5 grid grid-cols-2 gap-2">
                                {formats.map(({ format, label }) => (
                                    <li className="flex w-full" key={format}>
                                        <button
                                            type="button"
                                            disabled={exportDocument.isPending}
                                            onClick={() => exportDocument.mutate({ docId, format })}
                                            className={[
                                                "cursor-pointer w-full rounded-xl border border-(--w-border)",
                                                "bg-(--w-background) px-4 py-4 text-left",
                                                "transition-colors block text-sm font-medium",
                                                "text-(--w-foreground) hover:bg-(--w-surface-raised) disabled:cursor-wait disabled:opacity-60"
                                            ].join(" ")}
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-4 text-xs leading-5 text-(--w-subtle)">
                                Headings, lists, bold, italic, and line breaks are preserved where the
                                format supports them. PDF uses embedded Unicode-compatible fonts. Writely 2.0 guarantees
                                reliable PDF export for English only.
                            </p>
                        </section>
                    </section>
                )}
            </div>
        </div>
    );
}

export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const router = useRouter();
    const docId = params.docId ?? "";

    const {
        data: document,
        isLoading,
        error,
    } = api.docs.getSelectedDoc.useQuery(
        { docId },
        {
            refetchOnMount: "always",
            refetchOnWindowFocus: false,
            retry: false,
        },
    );

    useEffect(() => {
        if (error?.data?.code === "UNAUTHORIZED") {
            router.replace("/app");
        }
    }, [error, router]);

    if (isLoading) {
        return <Loading />;
    }

    if (error?.data?.code === "NOT_FOUND" || error?.data?.zodError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-(--w-background) px-6 text-(--w-foreground)">
                <section className="w-full max-w-md text-center">
                    <p className="text-xs font-medium tracking-[0.12em] text-(--w-subtle) uppercase">
                        Draft unavailable
                    </p>
                    <h1 className="mt-4 text-3xl font-medium tracking-tight">
                        This writing could not be opened.
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-(--w-muted)">
                        It may have been deleted, or it may belong to another account.
                    </p>
                    <Link
                        href="/app"
                        className={[
                            "mt-7 inline-flex min-h-11 items-center",
                            "justify-center rounded-xl bg-(--w-foreground) px-5",
                            "text-sm font-medium text-(--w-background) focus-visible:outline-2",
                            "focus-visible:outline-offset-2 focus-visible:outline-(--w-muted)",
                        ].join(" ")}
                    >
                        Back to drafts
                    </Link>
                </section>
            </main>
        );
    }

    if (error || !document) {
        return <ServerError />;
    }

    return <EditorRuntime key={docId} docId={docId} document={document} />;
}
