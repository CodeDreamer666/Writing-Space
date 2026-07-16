"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "~/components/shared/Loading";
import ServerError from "~/components/shared/ServerError";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { api, type RouterOutputs } from "~/trpc/react";
import { WRITING_MODES, type WritingMode } from "~/types/writing";
import { useDocumentAutosave } from "../hooks/useDocumentAutosave";
import {
    captureAiContext,
    isAiContextCurrent,
    replaceAiContext,
} from "../utils/aiContext";
import { countWords, readingTime } from "../utils/editorContent";
import AiWritingPanel from "./AiWritingPanel";
import EditorDocument from "./EditorDocument";
import EditorHeader from "./EditorHeader";
import EditorUtilityBar from "./EditorUtilityBar";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

function isWritingMode(value: string): value is WritingMode {
    return WRITING_MODES.includes(value as WritingMode);
}

function DocumentUnavailable() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0B0D10] px-6 text-[#F5F5F7]">
            <section className="w-full max-w-md text-center">
                <p className="text-xs font-medium tracking-[0.12em] text-[#6B7280] uppercase">
                    Draft unavailable
                </p>
                <h1 className="mt-4 text-3xl font-medium tracking-tight">
                    This writing could not be opened.
                </h1>
                <p className="mt-3 text-sm leading-7 text-[#8E96A3]">
                    It may have been deleted, or it may belong to another account.
                </p>
                <Link
                    href="/"
                    className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F5F5F7] px-5 text-sm font-medium text-[#0B0D10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
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
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start with the sentence you cannot stop thinking about",
            }),
        ],
        content: "<p></p>",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                "aria-label": "Draft content",
                class:
                    "min-h-[48vh] outline-none text-lg leading-[1.85] text-[#D5D9DF] transition-colors duration-200 focus:text-[#F5F5F7]",
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

    const [title, setTitle] = useState(document.title);
    const [wordCount, setWordCount] = useState(0);
    const [selectedMode, setSelectedMode] = useState<WritingMode>(
        isWritingMode(document.writingMode) ? document.writingMode : "Clear",
    );
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [selectionText, setSelectionText] = useState("");

    const handleSaveError = useCallback(
        (error: unknown) => {
            handleTRPCError({ error, router });
        },
        [handleTRPCError, router],
    );

    const {
        handleTitleChange,
        isHydrated,
        openSavedVersion,
        saveNow,
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
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.repeat ||
                !(event.ctrlKey || event.metaKey) ||
                event.key.toLowerCase() !== "s"
            ) {
                return;
            }

            event.preventDefault();
            void saveNow();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [saveNow]);

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

    const handleBackToDrafts = async () => {
        if (saveStatus === "conflict") {
            router.push("/");
            return;
        }

        if (saveStatus === "saved" || (await saveNow())) {
            router.push("/");
        }
    };

    if (!isHydrated) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-[#0B0D10] text-[#F5F5F7] transition-colors duration-300">
            <EditorHeader
                isAiOpen={isAiOpen}
                isConflict={saveStatus === "conflict"}
                isSaving={saveStatus === "saving"}
                onSave={() => {
                    void saveNow();
                }}
                onAiToggle={() => setIsAiOpen((isOpen) => !isOpen)}
            />

            <div className="mx-auto w-full max-w-6xl transition-all duration-300">
                <EditorDocument
                    editor={editor}
                    selectedMode={selectedMode}
                    isWritingModeSaving={updateWritingMode.isPending}
                    saveStatus={saveStatus}
                    title={title}
                    onModeChange={handleWritingModeChange}
                    onRetrySave={() => {
                        void saveNow();
                    }}
                    onOpenSavedVersion={openSavedVersion}
                    onTitleChange={handleTitleChange}
                    onAiOpen={() => setIsAiOpen(true)}
                />

                <EditorUtilityBar
                    wordCount={wordCount}
                    readingTime={readingTime(wordCount)}
                    onBackToDrafts={() => {
                        void handleBackToDrafts();
                    }}
                />

                <AiWritingPanel
                    isOpen={isAiOpen}
                    mode={selectedMode}
                    selectionWordCount={countWords(selectionText)}
                    hasSelection={selectionText.length > 0}
                    hasDocumentContent={wordCount > 0}
                    captureContext={() => captureAiContext(editor)}
                    isContextCurrent={(context) => isAiContextCurrent(editor, context)}
                    onReplace={(context, content) =>
                        replaceAiContext(editor, context, content)
                    }
                    onClose={() => setIsAiOpen(false)}
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
