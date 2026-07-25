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
import { useUiLanguage } from "~/hooks/useUiLanguage";
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
import { countWords } from "../utils/editorContent";
import { downloadExport } from "../utils/exportDownload";
import AiWritingPanel from "./AiWritingPanel";
import EditorDocument from "./EditorDocument";
import EditorTopBar from "./EditorTopBar";
import EditorUtilityBar from "./EditorUtilityBar";
import ExportDialog from "./ExportDialog";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

function isWritingMode(value: string): value is WritingMode {
    return WRITING_MODES.includes(value as WritingMode);
}

function DocumentUnavailable() {
    const { t } = useUiLanguage();

    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--w-background)] px-6 text-[var(--w-foreground)]">
            <section className="w-full max-w-md text-center">
                <p className="text-xs font-medium tracking-[0.12em] text-[var(--w-subtle)] uppercase">
                    {t("editor.unavailableLabel")}
                </p>
                <h1 className="mt-4 text-3xl font-medium tracking-tight">
                    {t("editor.unavailableTitle")}
                </h1>
                <p className="mt-3 text-sm leading-7 text-[var(--w-muted)]">
                    {t("editor.unavailableDescription")}
                </p>
                <Link
                    href="/"
                    className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-5 text-sm font-medium text-[var(--w-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
                >
                    {t("editor.backDrafts")}
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
    const { locale, t } = useUiLanguage();
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: t("editor.placeholder"),
            }),
            DocumentCharacterLimit.configure({
                limit: MAX_DOCUMENT_CHARACTERS,
                onLimitExceeded: () => {
                    showMessage(
                        t("editor.documentLimit", {
                            count: MAX_DOCUMENT_CHARACTERS.toLocaleString(locale),
                        }),
                        false,
                    );
                },
                onUnsupportedPictograph: () => {
                    showMessage(t("validation.pictograph"), false);
                },
            }),
        ],
        content: "<p></p>",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                "aria-label": t("editor.contentLabel"),
                class:
                    "min-h-[48vh] outline-none text-lg leading-[1.85] text-[var(--w-strong)] transition-colors duration-200 focus:text-[var(--w-foreground)]",
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
    const { locale, t } = useUiLanguage();

    const [title, setTitle] = useState(document.title);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [selectedMode, setSelectedMode] = useState<WritingMode>(
        isWritingMode(document.writingMode) ? document.writingMode : "Clear",
    );
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [selectionText, setSelectionText] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const createRequestRef = useRef(false);

    const createDocument = api.docs.createDoc.useMutation({
        onSuccess: (newDocument) => {
            void utils.docs.getUserDocs.invalidate();
            router.push(`/${newDocument.id}`);
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
        (aiStatusError ? t("editor.aiUnavailable") : t("editor.aiChecking"));

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
        };

        editor.on("selectionUpdate", updateSelection);

        return () => {
            editor.off("selectionUpdate", updateSelection);
        };
    }, [editor]);

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
            showMessage(t("validation.pictograph"), false);
            return;
        }

        handleTitleChange(nextTitle);
    };

    const handleBackToDrafts = async () => {
        if (saveStatus === "conflict" || saveStatus === "recovery") {
            router.push("/");
            return;
        }

        if (saveStatus === "saved" || (await savePendingChanges())) {
            router.push("/");
        }
    };

    const handleCreateDocument = async () => {
        if (createRequestRef.current || createDocument.isPending) {
            return;
        }

        createRequestRef.current = true;

        try {
            if (saveStatus === "conflict" || saveStatus === "recovery") {
                showMessage(t("editor.resolveRecovery"), false);
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

    const handleToggleFocus = () => {
        if (!isFocusMode) {
            setIsAiOpen(false);
            setIsExportOpen(false);
        }

        setIsFocusMode(!isFocusMode);
    };

    const handleOpenExport = () => {
        if (isFocusMode) {
            return;
        }

        setIsAiOpen(false);
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
        onToggleFocus: handleToggleFocus,
        onOpenExport: handleOpenExport,
        onEscape: () => {
            if (isExportOpen) {
                setIsExportOpen(false);
            } else if (isAiOpen) {
                setIsAiOpen(false);
            }
        },
    });

    useEffect(() => {
        window.document.body.dataset.focusMode = String(isFocusMode);

        return () => {
            delete window.document.body.dataset.focusMode;
        };
    }, [isFocusMode]);

    if (!isHydrated) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-[var(--w-background)] text-[var(--w-foreground)] transition-colors duration-300">
            <div className="mx-auto w-full max-w-6xl transition-all duration-300">
                <EditorTopBar
                    saveStatus={saveStatus}
                    isFocusMode={isFocusMode}
                    isExporting={isExporting}
                    onExport={handleOpenExport}
                    onToggleFocus={handleToggleFocus}
                />

                {!isFocusMode && aiStatus && !aiStatus.enabled && (
                    <p className="mx-4 mt-4 rounded-lg border border-[var(--w-border)] bg-[var(--w-surface-raised)] px-4 py-3 text-sm text-[var(--w-muted)] sm:mx-6 lg:mx-8">
                        {t("editor.aiUnavailable")}
                    </p>
                )}

                <EditorDocument
                    editor={editor}
                    selectedMode={selectedMode}
                    isWritingModeSaving={updateWritingMode.isPending}
                    saveStatus={saveStatus}
                    title={title}
                    characterCount={characterCount}
                    aiEnabled={aiEnabled}
                    isFocusMode={isFocusMode}
                    onModeChange={handleWritingModeChange}
                    onRetrySave={() => {
                        void savePendingChanges();
                    }}
                    onOpenSavedVersion={openSavedVersion}
                    onRestoreRecovery={restoreRecovery}
                    onDiscardRecovery={discardRecovery}
                    onTitleChange={handleValidatedTitleChange}
                    onAiOpen={() => {
                        if (!isFocusMode) {
                            setIsAiOpen(true);
                        }
                    }}
                />

                {!isFocusMode && (
                    <EditorUtilityBar
                        wordCount={wordCount}
                        readingTime={t("editor.readingTime", {
                            count: Math.max(1, Math.ceil(wordCount / 200)).toLocaleString(
                                locale,
                            ),
                        })}
                        onBackToDrafts={() => {
                            void handleBackToDrafts();
                        }}
                    />
                )}

                <AiWritingPanel
                    docId={docId}
                    isOpen={isAiOpen}
                    mode={selectedMode}
                    selectionWordCount={countWords(selectionText)}
                    selectionCharacterCount={selectionText.length}
                    hasSelection={selectionText.length > 0}
                    aiEnabled={aiEnabled}
                    aiMessage={aiMessage}
                    remainingTokens={aiStatus?.remainingTokens ?? 0}
                    captureContext={() => captureAiContext(editor)}
                    isContextCurrent={(context) => isAiContextCurrent(editor, context)}
                    onReplace={(context, content) =>
                        replaceAiContext(editor, context, content)
                    }
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
            router.replace("/");
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
