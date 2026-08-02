"use client";
import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    DAILY_AI_TOKEN_LIMIT,
    MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { api, type RouterOutputs } from "~/trpc/react";
import type { AiAction, CapturedAiContext } from "~/types/ai";
import { WRITING_MODES, type WritingMode } from "~/types/writing";
import {
    captureAiContext,
    isAiContextCurrent,
    replaceAiContext,
} from "../utils/aiContext";
import { countWords } from "../utils/editorContent";

type AiResponse = RouterOutputs["ai"]["askAi"];

type AiResult = {
    action: AiAction;
    context: CapturedAiContext;
    response: AiResponse;
};

type Props = {
    docId: string;
    isOpen: boolean;
    editor: Editor;
    initialMode: WritingMode;
    aiEnabled: boolean;
    aiMessage: string;
    remainingTokens: number;
    onClose: () => void;
};

const rewriteActions = [
        {
            action: "improveClarity",
            label: "Improve clarity",
            description: "Make the message easier to follow.",
        },
        {
            action: "fixGrammar",
            label: "Fix grammar",
            description: "Correct grammar without changing your voice.",
        },
        {
            action: "makeNatural",
            label: "Make natural",
            description: "Give the writing a more human flow.",
        },
        {
            action: "makeStronger",
            label: "Make stronger",
            description: "Use clearer, more confident language.",
        },
        {
            action: "makeConcise",
            label: "Make more concise",
            description: "Remove repetition and unnecessary wording.",
        },
        {
            action: "improveFlow",
            label: "Improve flow",
            description: "Help selected sentences connect more smoothly.",
        },
    ];

export default function AiWritingPanel({
    docId,
    isOpen,
    editor,
    initialMode,
    aiEnabled,
    aiMessage,
    remainingTokens,
    onClose,
}: Props) {
    const router = useRouter();
    const utils = api.useUtils();
    const handleTRPCError = useHandleTRPCError();
    const [result, setResult] = useState<AiResult | null>(null);
    const [lastAction, setLastAction] = useState<AiAction | null>(null);
    const [requestError, setRequestError] = useState("");
    const [selectionText, setSelectionText] = useState("");
    const [mode, setMode] = useState(initialMode);

    const askAi = api.ai.askAi.useMutation();

    const updateWritingMode = api.docs.updateWritingMode.useMutation({
        onSuccess: async (updatedDocument) => {
            utils.docs.getSelectedDoc.setData({ docId }, (currentDocument) =>
                currentDocument
                    ? { ...currentDocument, writingMode: updatedDocument.writingMode }
                    : currentDocument,
            );
            await utils.docs.getUserDocs.invalidate();
        },
    });

    const selectionWordCount = countWords(selectionText);
    const selectionCharacterCount = selectionText.length;
    const hasTarget = selectionCharacterCount > 0;
    const isSelectionOverLimit =
        selectionCharacterCount > MAX_AI_SELECTION_CHARACTERS;
    
    const remainingPercentage = Math.round(
        (Math.min(DAILY_AI_TOKEN_LIMIT, Math.max(0, remainingTokens)) /
            DAILY_AI_TOKEN_LIMIT) *
        100,
    );

    useEffect(() => {
        const updateSelection = () => {
            const { from, to } = editor.state.selection;
            setSelectionText(editor.state.doc.textBetween(from, to, "\n\n"));
            setRequestError("");
        };

        updateSelection();
        editor.on("selectionUpdate", updateSelection);

        return () => {
            editor.off("selectionUpdate", updateSelection);
        };
    }, [editor]);

    const changeWritingMode = (nextMode: WritingMode) => {
        if (updateWritingMode.isPending || nextMode === mode) {
            return;
        }

        const previousMode = mode;
        setMode(nextMode);
        updateWritingMode.mutate(
            { docId, writingMode: nextMode },
            {
                onError: (error) => {
                    setMode(previousMode);
                    handleTRPCError({ error, router });
                },
            },
        );
    };

    const runAction = (action: AiAction) => {
        if (askAi.isPending || !aiEnabled) {
            return;
        }

        const context = captureAiContext(editor);
        const target = context.selectedText;

        if (!target?.trim()) {
            setRequestError("Select the text you want Writely AI to work on.");
            return;
        }

        if (target.length > MAX_AI_SELECTION_CHARACTERS) {
            setRequestError(
                `AI selections can contain up to ${MAX_AI_SELECTION_CHARACTERS.toLocaleString("en")} characters.`,
            );
            return;
        }

        setResult(null);
        setRequestError("");
        setLastAction(action);

        askAi.mutate(
            {
                docId,
                action,
                mode,
                selectedText: context.selectedText,
                selectedHtml: context.selectedHtml,
            },
            {
                onSuccess: (response) => {
                    setResult({ action, context, response });
                    void utils.ai.getStatus.invalidate();
                },

                onError: (error) => {
                    setRequestError(
                        error.data?.zodError
                            ? "Please check your input and try again."
                            : error.message,
                    );

                    handleTRPCError({ error, router });
                },
            },
        );
    };

    const canReplace =
        result !== null && isAiContextCurrent(editor, result.context);

    const handleReplace = () => {
        if (!result) {
            return;
        }

        replaceAiContext(editor, result.context, result.response.improved);
        setResult(null);
        setLastAction(null);
    };

    return (
        <>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close AI panel"
                tabIndex={-1}
                className={`fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-panel-title"
                aria-hidden={!isOpen}
                inert={!isOpen}
                className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(100%,420px)] transform-gpu flex-col overflow-hidden border-l border-(--w-border) bg-(--w-surface)/98 shadow-[-24px_0_80px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
                    }`}
            >
                <div className="flex h-full min-h-0 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-(--w-border-soft) px-4 py-4">
                        <div>
                            <p
                                id="ai-panel-title"
                                className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase"
                            >
                                AI writing panel
                            </p>
                            <p className="mt-1.5 text-xs text-(--w-muted)">
                                {hasTarget
                                    ? `Selected text · ${selectionWordCount.toLocaleString("en")} ${selectionWordCount === 1 ? "word" : "words"
                                    }`
                                    : "Select text to begin"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-(--w-muted) transition-colors hover:bg-(--w-border-soft) hover:text-(--w-foreground)"
                            aria-label="Close AI panel"
                        >
                            <span className="text-lg leading-none">×</span>
                        </button>
                    </div>

                    <div className="ai-panel-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                        <div>
                            <label
                                htmlFor="writing-mode"
                                className="mb-2 block text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase"
                            >
                                Writing mode
                            </label>
                            <select
                                id="writing-mode"
                                value={mode}
                                disabled={updateWritingMode.isPending}
                                onChange={(event) =>
                                    changeWritingMode(event.target.value as WritingMode)
                                }
                                className={[
                                    "h-11 w-full cursor-pointer rounded-lg",
                                    "border border-(--w-border-soft) bg-(--w-background) px-3",
                                    "text-sm text-(--w-strong) outline-none hover:border-(--w-border)",
                                    "disabled:cursor-wait disabled:opacity-60",
                                ].join(" ")}
                            >
                                {WRITING_MODES.map((writingMode) => (
                                    <option key={writingMode} value={writingMode}>
                                        {writingMode}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs leading-relaxed text-(--w-subtle)">
                                Controls how AI adapts its suggestions across your documents.
                            </p>
                        </div>

                        <p className="text-xs leading-relaxed text-(--w-muted)">
                            Only your selected text is sent to the AI provider when you choose
                            an action.
                        </p>

                        {aiEnabled ? (
                            <div className="rounded-xl border border-(--w-border) bg-(--w-surface-raised) px-3.5 py-3">
                                <div className="flex items-center justify-between gap-4 text-xs">
                                    <span className="font-medium text-(--w-strong)">
                                        AI usage today
                                    </span>
                                    <span className="text-(--w-muted)">
                                        {remainingPercentage}% left
                                    </span>
                                </div>
                                <div
                                    role="progressbar"
                                    aria-label="AI allowance remaining"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={remainingPercentage}
                                    className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-(--w-border)"
                                >
                                    <div
                                        className="h-full rounded-full bg-(--w-foreground)"
                                        style={{ width: `${remainingPercentage}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-[11px] text-(--w-subtle)">
                                    Resets tomorrow
                                </p>
                            </div>
                        ) : (
                            <p className="rounded-lg border border-(--w-border) bg-(--w-surface-raised) px-3 py-2 text-xs leading-relaxed text-(--w-muted)">
                                {aiMessage}
                            </p>
                        )}

                        {!hasTarget && (
                            <p className="rounded-lg border border-(--w-border) bg-(--w-surface-raised) px-3 py-2 text-xs leading-relaxed text-(--w-muted)">
                                Select the text you want Writely AI to work on.
                            </p>
                        )}

                        {isSelectionOverLimit && (
                            <p
                                role="alert"
                                className="rounded-lg border border-(--w-border) bg-(--w-surface-raised) px-3 py-2 text-xs leading-relaxed text-(--w-muted)"
                            >
                                AI selections can contain up to{" "}
                                {MAX_AI_SELECTION_CHARACTERS.toLocaleString("en")} characters.
                            </p>
                        )}

                        <section>
                            <p className="mb-2 text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                                Selected text
                            </p>
                            <div className="flex flex-col gap-2">
                                {rewriteActions.map(({ action, label, description }) => (
                                    <button
                                        key={action}
                                        onClick={() => runAction(action as "improveClarity" | "fixGrammar" | "makeNatural" | "makeStronger" | "makeConcise" | "improveFlow")}
                                        disabled={
                                            askAi.isPending ||
                                            !hasTarget ||
                                            isSelectionOverLimit ||
                                            !aiEnabled
                                        }
                                        className={[
                                            "group flex cursor-pointer items-center",
                                            "justify-between rounded-xl border border-(--w-border-soft)",
                                            "bg-(--w-background) px-3.5 py-3 text-left",
                                            "transition-colors duration-200 hover:border-(--w-border) hover:bg-(--w-surface-raised)",
                                            "disabled:cursor-not-allowed disabled:opacity-50",
                                        ].join(" ")}
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-(--w-strong)">
                                                {label}
                                            </span>
                                            <span className="mt-1.5 block text-xs leading-5 text-(--w-muted)">
                                                {description}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-(--w-subtle) transition-transform duration-200 group-hover:translate-x-1 group-hover:text-(--w-muted)">
                                            →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section
                            className="min-h-32 rounded-xl border border-(--w-border-soft) bg-(--w-surface-raised) p-4"
                            aria-live="polite"
                        >
                            {askAi.isPending ? (
                                <div className="flex h-24 items-center justify-center gap-1.5">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--w-muted)" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--w-muted) [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--w-muted) [animation-delay:300ms]" />
                                </div>
                            ) : requestError ? (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-(--w-strong)">{requestError}</p>
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={() => lastAction && runAction(lastAction)}
                                            disabled={
                                                !hasTarget || isSelectionOverLimit || !aiEnabled
                                            }
                                            className="mt-3 cursor-pointer rounded-lg border border-(--w-border) px-3 py-2 text-xs font-medium text-(--w-strong) hover:bg-(--w-border-soft) disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="animate-[fadeIn_220ms_ease-out]">
                                    <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                                        {result.action}
                                    </p>

                                    <div className="mt-3 space-y-4">
                                        <section>
                                            <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                                                Original
                                            </p>
                                            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-(--w-muted)">
                                                {result.response.original}
                                            </p>
                                        </section>
                                        <section>
                                            <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                                                Improved version
                                            </p>
                                            <div
                                                className={[
                                                    "mt-2 text-sm leading-relaxed text-(--w-foreground)",
                                                    "[&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4",
                                                    "[&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg",
                                                    "[&_h3]:font-semibold [&_li]:ml-5 [&_ol]:my-2 [&_ol]:list-decimal",
                                                    "[&_p]:whitespace-pre-wrap [&_ul]:my-2 [&_ul]:list-disc",
                                                ].join(" ")}
                                                dangerouslySetInnerHTML={{
                                                    __html: result.response.improved,
                                                }}
                                            />
                                        </section>
                                        <section>
                                            <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
                                                What changed
                                            </p>
                                            <p className="mt-2 text-sm leading-relaxed text-(--w-strong)">
                                                {result.response.changes}
                                            </p>
                                        </section>
                                    </div>

                                    {!canReplace && (
                                        <p className="mt-3 text-xs leading-relaxed text-[#E2A66F]">
                                            The source text changed. Rerun this action before
                                            replacing it.
                                        </p>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={handleReplace}
                                            disabled={!canReplace}
                                            className="cursor-pointer rounded-lg bg-(--w-foreground) px-3 py-2 text-xs font-medium text-(--w-background) disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Replace
                                        </button>
                                        <button
                                            onClick={() => {
                                                setResult(null);
                                                setLastAction(null);
                                            }}
                                            className="cursor-pointer rounded-lg border border-(--w-border) px-3 py-2 text-xs font-medium text-(--w-muted) hover:bg-(--w-border-soft)"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed text-(--w-subtle)">
                                    Choose an action to see Writely’s response here.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </aside>
        </>
    );
}
