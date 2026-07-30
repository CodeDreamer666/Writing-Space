"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import Loading from "~/components/shared/Loading";
import ServerError from "~/components/shared/ServerError";
import { useWritelyShortcuts } from "~/hooks/useWritelyShortcuts";
import { MAX_DOCUMENT_CHARACTERS } from "~/lib/documentLimits";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { countUnsupportedPictographs } from "~/lib/writingLanguage";
import type { ExportFormat } from "~/server/documents/exportDocument";
import { api, type RouterOutputs } from "~/trpc/react";
import { WRITING_MODES, type WritingMode } from "~/types/writing";
import { useDocumentAutosave } from "../hooks/useDocumentAutosave";
import { DocumentCharacterLimit } from "../extensions/DocumentCharacterLimit";
import {
    captureAiContext,
    isAiContextCurrent,
    replaceAiContext,
} from "../utils/aiContext";
import { countWords, readingTime } from "../utils/editorContent";
import { downloadExport } from "../utils/exportDownload";
import AiWritingPanel from "./AiWritingPanel";
import EditorChrome from "./EditorChrome";
import EditorDocument from "./EditorDocument";
import ExportDialog from "./ExportDialog";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

function isWritingMode(value: string): value is WritingMode {
    return WRITING_MODES.includes(value as WritingMode);
}

function DocumentUnavailable() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--w-background)] px-6 text-[var(--w-foreground)]">
            <section className="w-full max-w-md text-center">
                <p className="text-xs font-medium tracking-[0.12em] text-[var(--w-subtle)] uppercase">
                    Draft unavailable
                </p>
                <h1 className="mt-4 text-3xl font-medium tracking-tight">
                    This writing could not be opened.
                </h1>
                <p className="mt-3 text-sm leading-7 text-[var(--w-muted)]">
                    It may have been deleted, or it may belong to another account.
                </p>
                <Link
                    href="/app"
                    className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-5 text-sm font-medium text-[var(--w-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
                >
                    Back to drafts
                </Link>
            </section>
        </main>
    );
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
                    "min-h-[48vh] outline-none text-[var(--w-strong)] transition-colors duration-200 focus:text-[var(--w-foreground)]",
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
    const utils = api.useUtils();
    const handleTRPCError = useHandleTRPCError();
    const { showMessage } = useStatusMessage();

    const [title, setTitle] = useState(document.title);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [selectedMode, setSelectedMode] = useState<WritingMode>(
        isWritingMode(document.writingMode) ? document.writingMode : "Clear",
    );
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectionText, setSelectionText] = useState("");
    const [selectionVersion, setSelectionVersion] = useState(0);
    const [aiPanelVersion, setAiPanelVersion] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const createRequestRef = useRef(false);

    const createDocument = api.docs.createDoc.useMutation({
        onSuccess: (newDocument) => {
            void utils.docs.getUserDocs.invalidate();
            router.push(`/app/${newDocument.id}`);
        },
        onError: (error) => {
            handleTRPCError({ error, router });
        },
    });

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

    const updateWritingMode = api.docs.updateWritingMode.useMutation({
        onSuccess: (result) => {
            utils.docs.getSelectedDoc.setData({ docId }, (currentDocument) => {
                if (!currentDocument) {
                    return currentDocument;
                }

                return {
                    ...currentDocument,
                    writingMode: result.writingMode,
                };
            });
            void utils.docs.getUserDocs.invalidate();
        },
    });

    useEffect(() => {
        const updateSelection = () => {
            const { from, to } = editor.state.selection;
            setSelectionText(editor.state.doc.textBetween(from, to, "\n\n"));
            setSelectionVersion((currentVersion) => currentVersion + 1);
        };

        editor.on("selectionUpdate", updateSelection);

        return () => {
            editor.off("selectionUpdate", updateSelection);
        };
    }, [editor]);

    const handleWritingModeChange = (nextMode: WritingMode) => {
        if (updateWritingMode.isPending || nextMode === selectedMode) {
            return;
        }

        const previousMode = selectedMode;
        setSelectedMode(nextMode);

        updateWritingMode.mutate(
            {
                docId,
                writingMode: nextMode,
            },
            {
                onError: (error) => {
                    setSelectedMode(previousMode);
                    handleTRPCError({ error, router });
                },
            },
        );
    };

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

    const handleCreateDocument = async () => {
        if (createRequestRef.current || createDocument.isPending) {
            return;
        }

        createRequestRef.current = true;

        try {
            if (saveStatus === "conflict" || saveStatus === "recovery") {
                showMessage(
                    "Resolve the current document recovery state before creating another draft.",
                    false,
                );
                return;
            }

            if (saveStatus !== "saved" && !(await savePendingChanges())) {
                return;
            }

            await createDocument.mutateAsync();
        } catch {
            // The mutation's onError handler provides the user-facing message.
        } finally {
            createRequestRef.current = false;
        }
    };

    const handleOpenExport = () => {
        setIsAiOpen(false);
        setIsMenuOpen(false);
        setIsExportOpen(true);
    };

    const handleExport = async (format: ExportFormat) => {
        if (isExporting) {
            return;
        }

        setIsExporting(true);

        try {
            if (saveStatus !== "saved" && !(await savePendingChanges())) {
                return;
            }

            const exportedDocument = await utils.client.docs.exportDoc.query({
                docId,
                format,
            });

            downloadExport(exportedDocument);
            setIsExportOpen(false);
        } catch (error) {
            handleTRPCError({ error, router });
        } finally {
            setIsExporting(false);
        }
    };

    useWritelyShortcuts({
        onCreateDocument: () => {
            void handleCreateDocument();
        },
        onOpenExport: handleOpenExport,
        onEscape: () => {
            if (isExportOpen) {
                setIsExportOpen(false);
            } else if (isAiOpen) {
                setIsAiOpen(false);
            } else if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        },
    });

    if (!isHydrated) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-[var(--w-background)] text-[var(--w-foreground)] transition-colors duration-300">
            <div className="w-full">
                <EditorChrome
                    isOpen={isMenuOpen}
                    saveStatus={saveStatus}
                    title={title}
                    wordCount={wordCount}
                    characterCount={characterCount}
                    readingTime={readingTime(wordCount)}
                    isExporting={isExporting}
                    onOpen={() => {
                        setIsAiOpen(false);
                        setIsMenuOpen(true);
                    }}
                    onClose={() => setIsMenuOpen(false)}
                    onTitleChange={handleValidatedTitleChange}
                    onExport={handleOpenExport}
                />

                <EditorDocument
                    editor={editor}
                    saveStatus={saveStatus}
                    aiEnabled={aiEnabled}
                    onRetrySave={() => {
                        void savePendingChanges();
                    }}
                    onOpenSavedVersion={openSavedVersion}
                    onRestoreRecovery={restoreRecovery}
                    onDiscardRecovery={discardRecovery}
                    onAiOpen={() => {
                        setIsMenuOpen(false);
                        setAiPanelVersion((currentVersion) => currentVersion + 1);
                        setIsAiOpen(true);
                    }}
                />

                <AiWritingPanel
                    docId={docId}
                    isOpen={isAiOpen}
                    mode={selectedMode}
                    isWritingModeSaving={updateWritingMode.isPending}
                    selectionWordCount={countWords(selectionText)}
                    selectionCharacterCount={selectionText.length}
                    selectionVersion={selectionVersion}
                    panelVersion={aiPanelVersion}
                    hasSelection={selectionText.length > 0}
                    aiEnabled={aiEnabled}
                    aiMessage={aiMessage}
                    remainingTokens={aiStatus?.remainingTokens ?? 0}
                    captureContext={() => captureAiContext(editor)}
                    isContextCurrent={(context) => isAiContextCurrent(editor, context)}
                    onReplace={(context, content) =>
                        replaceAiContext(editor, context, content)
                    }
                    onModeChange={handleWritingModeChange}
                    onClose={() => setIsAiOpen(false)}
                />

                <ExportDialog
                    isOpen={isExportOpen}
                    isExporting={isExporting}
                    onClose={() => setIsExportOpen(false)}
                    onExport={(format) => {
                        void handleExport(format);
                    }}
                />
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
        return <DocumentUnavailable />;
    }

    if (error || !document) {
        return <ServerError />;
    }

    return <EditorRuntime key={docId} docId={docId} document={document} />;
}
