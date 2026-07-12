"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { api, type RouterOutputs } from "~/trpc/react";
import type { AiAction, CapturedAiContext } from "~/types/ai";
import type { WritingMode } from "~/types/writing";
import AiRewriteComparison from "./AiRewriteComparison";

export type { CapturedAiContext } from "~/types/ai";

type AiResponse = RouterOutputs["ai"]["askAi"];

type AiResult = {
    action: AiAction;
    context: CapturedAiContext;
    response: AiResponse;
};

type Props = {
    isOpen: boolean;
    mode: WritingMode;
    selectionWordCount: number;
    hasSelection: boolean;
    hasDocumentContent: boolean;
    captureContext: () => CapturedAiContext;
    isContextCurrent: (context: CapturedAiContext) => boolean;
    onReplace: (context: CapturedAiContext, content: string) => void;
    onClose: () => void;
};

const rewriteActions: Array<{
    action: AiAction;
    label: string;
    description: string;
}> = [
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
    ];

const thinkingActions: Array<{
    action: AiAction;
    label: string;
    description: string;
}> = [
        {
            action: "findWeakPoints",
            label: "Find weak points",
            description: "Spot unclear, repetitive, or unsupported ideas.",
        },
        {
            action: "suggestDirections",
            label: "Suggest directions",
            description: "Explore useful ways to develop the draft.",
        },
    ];

const actionLabels: Record<AiAction, string> = {
    improveClarity: "Improve clarity",
    fixGrammar: "Fix grammar",
    makeNatural: "Make natural",
    makeStronger: "Make stronger",
    findWeakPoints: "Find weak points",
    suggestDirections: "Suggest directions",
    custom: "Ask Writely",
};

export default function AiWritingPanel({
    isOpen,
    mode,
    selectionWordCount,
    hasSelection,
    hasDocumentContent,
    captureContext,
    isContextCurrent,
    onReplace,
    onClose,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const handleTRPCError = useHandleTRPCError();
    const [customPrompt, setCustomPrompt] = useState("");
    const [result, setResult] = useState<AiResult | null>(null);
    const [lastRequest, setLastRequest] = useState<{
        action: AiAction;
        instruction?: string;
    } | null>(null);
    const [copyLabel, setCopyLabel] = useState("Copy");

    const askAi = api.ai.askAi.useMutation();
    const hasTarget = hasSelection || hasDocumentContent;

    const runAction = (action: AiAction, instruction?: string) => {
        if (askAi.isPending) {
            return;
        }

        const context = captureContext();
        const target =
            context.scope === "selection"
                ? context.selectedText
                : context.fullDocument;

        if (!target?.trim()) {
            return;
        }

        setResult(null);
        setLastRequest({ action, instruction });

        askAi.mutate(
            {
                action,
                mode,
                scope: context.scope,
                selectedText: context.selectedText,
                fullDocument: context.fullDocument,
                instruction,
            },
            {
                onSuccess: (response) => {
                    setResult({ action, context, response });
                },
                onError: (error) => {
                    handleTRPCError({ error, router, pathname });
                },
            },
        );
    };

    const handleCustomSubmit = () => {
        const instruction = customPrompt.trim();

        if (!instruction) {
            return;
        }

        runAction("custom", instruction);
    };

    const handleCopy = async () => {
        if (result?.response.type !== "response") {
            return;
        }

        await navigator.clipboard.writeText(result.response.content);
        setCopyLabel("Copied");
        window.setTimeout(() => setCopyLabel("Copy"), 1200);
    };

    const canReplace =
        result?.response.type === "rewrite" && isContextCurrent(result.context);

    const handleReplace = () => {
        if (result?.response.type !== "rewrite") {
            return;
        }

        onReplace(result.context, result.response.improved);
        setResult(null);
        setLastRequest(null);
    };

    return (
        <>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close AI panel"
                tabIndex={isOpen ? 0 : -1}
                className={`fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            <aside
                className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(100%,420px)] transform-gpu flex-col overflow-hidden border-l border-[#2A313C] bg-[#10151B]/98 shadow-[-24px_0_80px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
                    }`}
            >
                <div className="flex h-full min-h-0 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#262C36] px-4 py-4">
                        <div>
                            <p className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
                                AI writing panel
                            </p>
                            <p className="mt-1.5 text-xs text-[#AEB4BE]">
                                {hasSelection
                                    ? `Selected text · ${selectionWordCount} ${selectionWordCount === 1 ? "word" : "words"
                                    }`
                                    : "Entire document"}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#8E96A3] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7]"
                            aria-label="Close AI panel"
                        >
                            <span className="text-lg leading-none">×</span>
                        </button>
                    </div>

                    <div className="ai-panel-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                        {!hasTarget && (
                            <p className="rounded-lg border border-[#343C49] bg-[#151A20] px-3 py-2 text-xs leading-relaxed text-[#AEB4BE]">
                                Start writing or select text to use Writely AI.
                            </p>
                        )}

                        <section>
                            <p className="mb-2 text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
                                Selected text
                            </p>
                            <div className="flex flex-col gap-2">
                                {rewriteActions.map(({ action, label, description }) => (
                                    <button
                                        key={action}
                                        onClick={() => runAction(action)}
                                        disabled={askAi.isPending || !hasTarget}
                                        className="group flex justify-between items-center cursor-pointer rounded-xl border border-[#222A35] bg-[#0B0D10] px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#394352] hover:bg-[#121820] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-[#E5E7EA]">
                                                {label}
                                            </span>
                                            <span className="mt-1.5 block text-xs leading-5 text-[#707987]">
                                                {description}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-[#596272] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#AEB4BE]">
                                            →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <p className="mb-2 text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
                                Thinking
                            </p>
                            <div className="space-y-2">
                                {thinkingActions.map(({ action, label, description }) => (
                                    <button
                                        key={action}
                                        onClick={() => runAction(action)}
                                        disabled={askAi.isPending || !hasTarget}
                                        className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#222A35] bg-[#0B0D10] px-3.5 py-3 text-left transition-all duration-200 hover:border-[#394352] hover:bg-[#121820] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-[#E5E7EA]">
                                                {label}
                                            </span>
                                            <span className="mt-1 block truncate text-xs text-[#707987]">
                                                {description}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-[#596272] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#AEB4BE]">
                                            →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <label
                                htmlFor="custom-prompt"
                                className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase"
                            >
                                Custom
                            </label>
                            <div className="mt-2 rounded-xl border border-[#262C36] bg-[#0B0D10] p-3">
                                <textarea
                                    id="custom-prompt"
                                    value={customPrompt}
                                    onChange={(event) => setCustomPrompt(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" &&
                                            (event.ctrlKey || event.metaKey)
                                        ) {
                                            event.preventDefault();
                                            handleCustomSubmit();
                                        }
                                    }}
                                    placeholder="Ask Writely..."
                                    rows={3}
                                    className="w-full resize-none bg-transparent text-sm leading-relaxed text-[#E5E7EA] outline-none placeholder:text-[#4A5363]"
                                />
                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-[#596272]">
                                        Ctrl/⌘ + Enter
                                    </span>
                                    <button
                                        onClick={handleCustomSubmit}
                                        disabled={
                                            !customPrompt.trim() || askAi.isPending || !hasTarget
                                        }
                                        className="cursor-pointer rounded-lg bg-[#F5F5F7] px-4 py-2 text-xs font-medium text-[#0B0D10] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section
                            className="min-h-32 rounded-xl border border-[#262C36] bg-[#151A20] p-4"
                            aria-live="polite"
                        >
                            {askAi.isPending ? (
                                <div className="flex h-24 items-center justify-center gap-1.5">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8E96A3]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8E96A3] [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8E96A3] [animation-delay:300ms]" />
                                </div>
                            ) : askAi.isError || (lastRequest && !result) ? (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-[#D5D9DF]">
                                        Writely AI is unavailable right now. Please try again.
                                    </p>
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={() =>
                                                lastRequest &&
                                                runAction(lastRequest.action, lastRequest.instruction)
                                            }
                                            disabled={!hasTarget}
                                            className="mt-3 cursor-pointer rounded-lg border border-[#343C49] px-3 py-2 text-xs font-medium text-[#E5E7EA] hover:bg-[#1E2530] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="animate-[fadeIn_220ms_ease-out]">
                                    <p className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
                                        {actionLabels[result.action]}
                                    </p>

                                    {result.response.type === "rewrite" ? (
                                        <AiRewriteComparison
                                            original={result.response.original}
                                            improved={result.response.improved}
                                            changes={result.response.changes}
                                        />
                                    ) : (
                                        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-[#D5D9DF]">
                                            {result.response.content}
                                        </p>
                                    )}

                                    {result.response.type === "rewrite" && !canReplace && (
                                        <p className="mt-3 text-xs leading-relaxed text-[#E2A66F]">
                                            The source text changed. Rerun this action before
                                            replacing it.
                                        </p>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        {result.response.type === "rewrite" ? (
                                            <button
                                                onClick={handleReplace}
                                                disabled={!canReplace}
                                                className="cursor-pointer rounded-lg bg-[#F5F5F7] px-3 py-2 text-xs font-medium text-[#0B0D10] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Replace
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleCopy}
                                                className="cursor-pointer rounded-lg bg-[#F5F5F7] px-3 py-2 text-xs font-medium text-[#0B0D10]"
                                            >
                                                {copyLabel}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setResult(null);
                                                setLastRequest(null);
                                            }}
                                            className="cursor-pointer rounded-lg border border-[#343C49] px-3 py-2 text-xs font-medium text-[#AEB4BE] hover:bg-[#1E2530]"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-24 items-center">
                                    <p className="text-sm leading-relaxed text-[#6B7280]">
                                        Choose an action to see Writely’s response here.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </aside>
        </>
    );
}
