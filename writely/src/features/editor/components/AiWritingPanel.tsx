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
        action: "clarify",
        label: "Clarify",
        description: "Clearer meaning with less ambiguity.",
    },
    {
        action: "makeNatural",
        label: "Natural",
        description: "Smoother, more human-sounding language.",
    },
    {
        action: "strengthen",
        label: "Strengthen",
        description: "Sharper wording with more confidence.",
    },
    {
        action: "tighten",
        label: "Tighten",
        description: "Fewer words, same meaning.",
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
    const [activeContext, setActiveContext] = useState<CapturedAiContext | null>(
        null,
    );
    const [mode, setMode] = useState(initialMode);

    const askAi = api.ai.askAi.useMutation();
    
    // Error handling issues
    const updateWritingMode = api.docs.updateWritingMode.useMutation({
        onSuccess: async (updatedDocument) => {
            utils.docs.getSelectedDoc.setData({ docId }, (currentDocument) =>
                currentDocument
                    ? { ...currentDocument, writingMode: updatedDocument.writingMode }
                    : currentDocument,
            );
        },

        onError: (error) => {
            handleTRPCError({ error, router });
        },

        onSettled: async () => {
            await utils.invalidate();
        }
    });

    const selectionText = activeContext?.selectedText ?? "";

    const selectionWordCount = countWords(selectionText);

    const selectionCharacterCount = selectionText.length;

    const hasTarget = selectionCharacterCount > 0;

    const isSelectionOverLimit =
        selectionCharacterCount > MAX_AI_SELECTION_CHARACTERS;

    const isContextStale =
        activeContext !== null && !isAiContextCurrent(editor, activeContext);

    const remainingPercentage = Math.round(
        (Math.min(DAILY_AI_TOKEN_LIMIT, Math.max(0, remainingTokens)) /
            DAILY_AI_TOKEN_LIMIT) *
        100,
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setActiveContext(captureAiContext(editor));
        setRequestError("");
    }, [isOpen, editor]);


    const runAction = (action: AiAction) => {
        if (askAi.isPending || !aiEnabled) {
            return;
        }

        const context = activeContext;
        const target = context?.selectedText;

        if (!context || !target?.trim()) {
            setRequestError("Select the text you want Writely AI to work on.");
            return;
        }

        if (!isAiContextCurrent(editor, context)) {
            setRequestError(
                "Your selection changed. Select the text again before continuing.",
            );
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
                className={`fixed inset-0 z-40 cursor-default bg-black/80 transition-opacity duration-300 ease-out motion-reduce:transition-none ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-panel-title"
                aria-hidden={!isOpen}
                inert={!isOpen}
                className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(100%,440px)] transform-gpu flex-col overflow-hidden border-l border-(--w-foreground) bg-(--w-background) transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
                    }`}
            >
                <div className="flex h-full min-h-0 flex-col">
                    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-(--w-foreground) px-6 py-5">
                        <div>
                            <p
                                id="ai-panel-title"
                                className="font-mono-label text-[10px] tracking-[0.22em] uppercase"
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
                            className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-(--w-muted) hover:text-(--w-foreground)"
                            aria-label="Close AI panel"
                        >
                            <span className="text-lg leading-none">×</span>
                        </button>
                    </div>

                    <div className="ai-panel-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <div className="border-b border-(--w-border-soft) px-6 py-[22px]">
                            <label
                                htmlFor="writing-mode"
                                className="font-mono-label mb-3 block text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase"
                            >
                                Writing mode
                            </label>
                            <select
                                id="writing-mode"
                                value={mode}
                                disabled={updateWritingMode.isPending}
                                onChange={(event) =>
                                    updateWritingMode.mutate({ docId, writingMode: event.target.value as WritingMode })
                                }
                                className={[
                                    "h-[46px] w-full cursor-pointer rounded-none",
                                    "border border-(--w-foreground) bg-(--w-background) px-3.5",
                                    "text-sm text-(--w-strong) outline-none",
                                    "disabled:cursor-wait disabled:opacity-60",
                                ].join(" ")}
                            >
                                {WRITING_MODES.map((writingMode) => (
                                    <option key={writingMode} value={writingMode}>
                                        {writingMode}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-3 text-xs leading-[1.7] text-(--w-subtle)">
                                Controls how AI adapts its suggestions across your documents.
                            </p>
                        </div>

                        {aiEnabled ? (
                            <div className="border-b border-(--w-border-soft) px-6 py-5">
                                <div className="flex items-center justify-between gap-4 text-xs">
                                    <span className="font-mono-label text-[10px] tracking-[0.18em] text-(--w-subtle) uppercase">
                                        AI usage today
                                    </span>
                                    <span className="font-mono-label text-[11px] text-(--w-foreground)">
                                        {remainingPercentage}% left
                                    </span>
                                </div>
                                <div
                                    role="progressbar"
                                    aria-label="AI allowance remaining"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={remainingPercentage}
                                    className="mt-3 h-0.5 overflow-hidden bg-(--w-border-soft)"
                                >
                                    <div
                                        className="h-full bg-(--w-foreground)"
                                        style={{ width: `${remainingPercentage}%` }}
                                    />
                                </div>
                                <p className="font-mono-label mt-2.5 text-[10px] tracking-[0.14em] text-(--w-subtle) uppercase">
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

                        {hasTarget && isContextStale && (
                            <p
                                role="alert"
                                className="rounded-lg border border-(--w-border) bg-(--w-surface-raised) px-3 py-2 text-xs leading-relaxed text-(--w-muted)"
                            >
                                The source text changed. Select it again before continuing.
                            </p>
                        )}

                        <section className="pt-5">
                            <p className="font-mono-label mb-1 pb-3 px-6 text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase">
                                Actions
                            </p>
                            <div className="flex flex-col border-t border-(--w-border-soft)">
                                {rewriteActions.map(({ action, label, description }) => (
                                    <button
                                        key={action}
                                        onClick={() => runAction(action as AiAction)}
                                        disabled={
                                            askAi.isPending ||
                                            !hasTarget ||
                                            isSelectionOverLimit ||
                                            isContextStale ||
                                            !aiEnabled
                                        }
                                        className={[
                                            "group flex cursor-pointer items-center justify-between",
                                            "border-0 border-b border-(--w-border-soft)",
                                            "bg-(--w-background) px-6 py-4 text-left",
                                            "hover:bg-(--w-foreground) hover:text-(--w-background)",
                                            "disabled:cursor-not-allowed disabled:opacity-50",
                                        ].join(" ")}
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-inherit">
                                                {label}
                                            </span>
                                            <span className="mt-1 block text-xs leading-[1.5] opacity-60">
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

                        <section className="min-h-40 p-6" aria-live="polite">
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
                                                !hasTarget ||
                                                isSelectionOverLimit ||
                                                isContextStale ||
                                                !aiEnabled
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
