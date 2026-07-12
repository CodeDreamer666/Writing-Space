"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SuperJSON from "superjson";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { api } from "~/trpc/react";
import type { WritingMode } from "~/types/writing";
import AiWritingPanel from "./AiWritingPanel";
import EditorDocument from "./EditorDocument";
import EditorHeader from "./EditorHeader";
import EditorUtilityBar, { type EditorSaveStatus } from "./EditorUtilityBar";
import {
    countWords,
    DEFAULT_TITLE,
    isEditorContent,
    readingTime,
} from "../utils/editorContent";
import {
    captureAiContext,
    isAiContextCurrent,
    replaceAiContext,
} from "../utils/aiContext";

export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const handleTRPCError = useHandleTRPCError();
    const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasInitializedDocumentRef = useRef(false);
    const isHydratingDocumentRef = useRef(false);
    const hasHandledDocumentErrorRef = useRef(false);
    const changeVersionRef = useRef(0);
    const hasUnsavedChangesRef = useRef(false);
    const pendingSaveVersionRef = useRef<number | null>(null);
    const exitSaveSentRef = useRef(false);
    const handleSaveRef = useRef<() => void>(() => undefined);
    const titleRef = useRef(DEFAULT_TITLE);
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [wordCount, setWordCount] = useState(0);
    const [selectedMode, setSelectedMode] = useState<WritingMode>("Clear");
    const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>("idle");
    const [shortcutHint, setShortcutHint] = useState("Ctrl + S to save");
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [selectionText, setSelectionText] = useState("");
    const docId = params.docId ?? "";
    const utils = api.useUtils();

    const clearSaveStatusTimer = () => {
        if (saveStatusTimerRef.current) {
            clearTimeout(saveStatusTimerRef.current);
            saveStatusTimerRef.current = null;
        }
    };

    const markUnsaved = () => {
        clearSaveStatusTimer();
        changeVersionRef.current += 1;
        hasUnsavedChangesRef.current = true;
        setSaveStatus("unsaved");
    };

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
                class:
                    "min-h-[48vh] outline-none text-lg leading-[1.85] text-[#D5D9DF] transition-colors duration-200 focus:text-[#F5F5F7]",
            },
        },

        onCreate: ({ editor: createdEditor }) => {
            setWordCount(countWords(createdEditor.getText()));
        },

        onUpdate: ({ editor: updatedEditor }) => {
            setWordCount(countWords(updatedEditor.getText()));

            if (!isHydratingDocumentRef.current) {
                markUnsaved();
            }
        },
        onSelectionUpdate: ({ editor: updatedEditor }) => {
            const { from, to } = updatedEditor.state.selection;
            setSelectionText(updatedEditor.state.doc.textBetween(from, to, "\n\n"));
        },
    });

    const {
        data: document,
        isLoading: isDocumentLoading,
        error: documentError,
    } = api.docs.getSelectedDoc.useQuery(
        { docId },
        {
            enabled: Boolean(docId),
            refetchOnMount: "always",
            refetchOnWindowFocus: true,
        },
    );
    const saveDoc = api.docs.saveDoc.useMutation({
        onSettled: async () => {
            await utils.invalidate();
        },
    });

    useEffect(() => {
        hasInitializedDocumentRef.current = false;
        hasHandledDocumentErrorRef.current = false;
        exitSaveSentRef.current = false;
    }, [docId]);

    useEffect(() => {
        if (!documentError || hasHandledDocumentErrorRef.current) {
            return;
        }

        hasHandledDocumentErrorRef.current = true;

        handleTRPCError({ error: documentError, router, pathname });

    }, [documentError, handleTRPCError, pathname, router]);

    useEffect(() => {
        if (!document || !editor || hasInitializedDocumentRef.current) {
            return;
        }

        isHydratingDocumentRef.current = true;

        const documentTitle = document.title || DEFAULT_TITLE;

        setTitle(documentTitle);

        titleRef.current = documentTitle;

        editor.commands.setContent(
            isEditorContent(document.content) ? document.content : "<p></p>",
        );

        setWordCount(countWords(editor.getText()));
        setSelectionText("");
        setSaveStatus("idle");
        hasUnsavedChangesRef.current = false;
        hasInitializedDocumentRef.current = true;
        isHydratingDocumentRef.current = false;
    }, [document, editor]);

    useEffect(() => {
        const isMac = navigator.platform.toUpperCase().includes("MAC");
        setShortcutHint(isMac ? "⌘ + S to save" : "Ctrl + S to save");
    }, []);

    useEffect(() => {
        return clearSaveStatusTimer;
    }, []);

    useEffect(() => {
        if (isFocusMode) {
            setIsAiOpen(false);
        }
    }, [isFocusMode]);

    const getSavePayload = useCallback(() => {
        if (!editor || !docId) {
            return null;
        }

        return {
            docId,
            title: titleRef.current.trim() || DEFAULT_TITLE,
            content: editor.getJSON(),
        };
    }, [docId, editor]);

    const handleSave = useCallback(() => {
        if (!editor || !docId || saveDoc.isPending) {
            return;
        }

        clearSaveStatusTimer();
        const savedChangeVersion = changeVersionRef.current;
        const savePayload = getSavePayload();

        if (!savePayload) {
            return;
        }

        const savedTitle = savePayload.title;
        const showSaveOutcome = (status: "saved" | "failed") => {
            setSaveStatus(status);
            saveStatusTimerRef.current = setTimeout(() => {
                setSaveStatus("idle");
            }, 2200);
        };

        setSaveStatus("saving");
        pendingSaveVersionRef.current = savedChangeVersion;

        saveDoc.mutate(savePayload, {
            onSuccess: () => {
                setTitle(savedTitle);
                titleRef.current = savedTitle;
                pendingSaveVersionRef.current = null;

                if (changeVersionRef.current === savedChangeVersion) {
                    hasUnsavedChangesRef.current = false;
                    showSaveOutcome("saved");
                    return;
                }

                setSaveStatus("unsaved");
            },
            onError: (error) => {
                pendingSaveVersionRef.current = null;
                handleTRPCError({ error, router, pathname });
                showSaveOutcome("failed");
            },
        });
    }, [
        docId,
        editor,
        getSavePayload,
        handleTRPCError,
        pathname,
        router,
        saveDoc,
    ]);

    const sendExitSave = useCallback(() => {
        if (exitSaveSentRef.current || !hasUnsavedChangesRef.current) {
            return;
        }

        const savePayload = getSavePayload();

        if (!savePayload) {
            return;
        }

        exitSaveSentRef.current = true;

        utils.docs.getSelectedDoc.setData(
            { docId: savePayload.docId },
            (previousDocument) => {
                if (!previousDocument) {
                    return previousDocument;
                }

                return {
                    ...previousDocument,
                    title: savePayload.title,
                    content: savePayload.content,
                };
            },
        );

        utils.invalidate();

        const input = SuperJSON.serialize(savePayload);

        void fetch("/api/trpc/docs.saveDoc?batch=1", {
            method: "POST",
            credentials: "same-origin",
            keepalive: true,
            headers: {
                "content-type": "application/json",
                "x-trpc-source": "nextjs-react",
            },
            body: JSON.stringify({ 0: input }),
        });
    }, [getSavePayload, utils]);

    useEffect(() => {
        handleSaveRef.current = handleSave;
    }, [handleSave]);

    useEffect(() => {
        const handlePageHide = () => {
            sendExitSave();
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                exitSaveSentRef.current = false;
            }
        };

        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pagehide", handlePageHide);
            window.removeEventListener("pageshow", handlePageShow);

            if (
                hasUnsavedChangesRef.current &&
                pendingSaveVersionRef.current !== changeVersionRef.current
            ) {
                handleSaveRef.current();
            }
        };
    }, [sendExitSave]);
    
    // Ctrl + s = save
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
            handleSave();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSave]);

    if (!editor || isDocumentLoading || documentError || !document) {
        return null;
    }

    return (
        <div
            className={`min-h-screen bg-[#0B0D10] text-[#F5F5F7] transition-colors duration-300 ${isFocusMode ? "bg-[#080A0D]" : ""
                }`}
        >
            <EditorHeader
                isAiOpen={isAiOpen}
                isFocusMode={isFocusMode}
                onAiToggle={() => setIsAiOpen((isOpen) => !isOpen)}
                onFocusToggle={() => setIsFocusMode((current) => !current)}
            />

            <div
                className={`mx-auto w-full transition-all duration-300 ${isFocusMode ? "max-w-4xl" : "max-w-6xl"
                    }`}
            >
                <EditorDocument
                    editor={editor}
                    isFocusMode={isFocusMode}
                    selectedMode={selectedMode}
                    title={title}
                    onModeChange={setSelectedMode}
                    onTitleChange={(nextTitle) => {
                        setTitle(nextTitle);
                        titleRef.current = nextTitle;
                        markUnsaved();
                    }}
                    onAiOpen={() => setIsAiOpen(true)}
                />

                {!isFocusMode && (
                    <EditorUtilityBar
                        wordCount={wordCount}
                        readingTime={readingTime(wordCount)}
                        saveStatus={saveStatus}
                        shortcutHint={shortcutHint}
                    />
                )}

                {!isFocusMode && (
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
                )}
            </div>
        </div>
    );
}
