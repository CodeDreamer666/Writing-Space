"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { api } from "~/trpc/react";
import { WRITING_MODES, type WritingMode } from "~/types/writing";
import AiWritingPanel from "./AiWritingPanel";
import EditorDocument from "./EditorDocument";
import EditorHeader from "./EditorHeader";
import EditorUtilityBar from "./EditorUtilityBar";
import LeaveEditorModal from "./LeaveEditorModal";
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

function isWritingMode(value: string): value is WritingMode {
    return WRITING_MODES.includes(value as WritingMode);
}
export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const router = useRouter();
    const docId = params.docId ?? "";
    const utils = api.useUtils();
    const handleTRPCError = useHandleTRPCError();
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [wordCount, setWordCount] = useState(0);
    const [selectedMode, setSelectedMode] = useState<WritingMode>("Clear");
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [selectionText, setSelectionText] = useState("");
    const [isSaveReminderVisible, setIsSaveReminderVisible] = useState(true);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [dontRemindAgain, setDontRemindAgain] = useState(false);

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
            refetchOnMount: "always",
            refetchOnWindowFocus: true,
        },
    );

    const { data: leaveReminderPreference } =
        api.docs.getLeaveReminderPreference.useQuery();
    const isLeaveReminderDisabled =
        leaveReminderPreference?.leaveReminderDisabled ?? false;

    const saveDoc = api.docs.saveDoc.useMutation({
        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const setLeaveReminderDisabled =
        api.docs.setLeaveReminderDisabled.useMutation();

    const updateWritingMode = api.docs.updateWritingMode.useMutation({
        onSettled: async () => {
            await utils.invalidate();
        },
    });

    useEffect(() => {
        if (!document || !editor) {
            return;
        }

        const documentTitle = document.title || DEFAULT_TITLE;
        const documentWritingMode = isWritingMode(document.writingMode)
            ? document.writingMode
            : "Clear";

        setTitle(documentTitle);
        setSelectedMode(documentWritingMode);

        editor.commands.setContent(
            isEditorContent(document.content) ? document.content : "<p></p>",
        );

        setWordCount(countWords(editor.getText()));
        setSelectionText("");
    }, [document, editor]);

    const handleSave = useCallback(async () => {
        if (!editor || !docId || saveDoc.isPending) {
            return false;
        }

        const savePayload = {
            docId,
            title: title.trim() || DEFAULT_TITLE,
            content: editor.getJSON(),
        };

        try {
            await saveDoc.mutateAsync(savePayload);
            setTitle(savePayload.title);
            return true;
        } catch (error) {
            handleTRPCError({ error, router });
            return false;
        }
    }, [docId, editor, handleTRPCError, router, saveDoc, title]);

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

            void handleSave();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSave]);

    useEffect(() => {
        if (isLeaveReminderDisabled) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isLeaveReminderDisabled]);

    const saveLeaveReminderPreference = async () => {
        if (!dontRemindAgain) {
            return true;
        }

        try {
            await setLeaveReminderDisabled.mutateAsync({ disabled: true });
            return true;
        } catch (error) {
            handleTRPCError({ error, router });
            return false;
        }
    };

    const handleBackToDrafts = () => {
        if (isLeaveReminderDisabled) {
            router.push("/");
            return;
        }

        setDontRemindAgain(false);
        setIsLeaveModalOpen(true);
    };

    const handleLeavePage = async () => {
        if (setLeaveReminderDisabled.isPending) {
            return;
        }

        const didSavePreference = await saveLeaveReminderPreference();

        if (didSavePreference) {
            router.push("/");
        }
    };

    const handleSaveAndLeave = async () => {
        if (saveDoc.isPending || setLeaveReminderDisabled.isPending) {
            return;
        }

        const didSaveDocument = await handleSave();

        if (!didSaveDocument) {
            return;
        }

        const didSavePreference = await saveLeaveReminderPreference();

        if (didSavePreference) {
            router.push("/");
        }
    };

    if (!editor || isDocumentLoading || documentError || !document) {
        return null;
    }

    return (
        <div
            className={`min-h-screen bg-[#0B0D10] text-[#F5F5F7] transition-colors duration-300`}
        >
            <EditorHeader
                isAiOpen={isAiOpen}
                isSaving={saveDoc.isPending}
                onSave={() => {
                    void handleSave();
                }}
                onAiToggle={() => setIsAiOpen((isOpen) => !isOpen)}
            />

            <div className={`mx-auto w-full max-w-6xl transition-all duration-300`}>
                <EditorDocument
                    editor={editor}
                    selectedMode={selectedMode}
                    isWritingModeSaving={updateWritingMode.isPending}
                    isSaveReminderVisible={isSaveReminderVisible}
                    title={title}
                    onModeChange={handleWritingModeChange}
                    onDismissSaveReminder={() => setIsSaveReminderVisible(false)}
                    onTitleChange={(nextTitle) => {
                        setTitle(nextTitle);
                    }}
                    onAiOpen={() => setIsAiOpen(true)}
                />

                <EditorUtilityBar
                    wordCount={wordCount}
                    readingTime={readingTime(wordCount)}
                    onBackToDrafts={handleBackToDrafts}
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

            <LeaveEditorModal
                isOpen={isLeaveModalOpen}
                dontRemindAgain={dontRemindAgain}
                isSaving={saveDoc.isPending}
                isUpdatingPreference={setLeaveReminderDisabled.isPending}
                onDontRemindAgainChange={setDontRemindAgain}
                onLeave={() => {
                    void handleLeavePage();
                }}
                onSaveAndLeave={() => {
                    void handleSaveAndLeave();
                }}
            />
        </div>
    );
}
