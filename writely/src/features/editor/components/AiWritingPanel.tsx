"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import { MAX_AI_SELECTION_CHARACTERS } from "~/lib/aiLimits";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import type { UiTranslationKey } from "~/lib/uiTranslations";
import { api, type RouterOutputs } from "~/trpc/react";
import type { AiAction, CapturedAiContext } from "~/types/ai";
import type { WritingMode } from "~/types/writing";
import AiRewriteComparison from "./AiRewriteComparison";
import AiUsageMeter from "./AiUsageMeter";

export type { CapturedAiContext } from "~/types/ai";

type AiResponse = RouterOutputs["ai"]["askAi"];

type AiResult = {
  action: AiAction;
  context: CapturedAiContext;
  response: AiResponse;
};

type Props = {
  docId: string;
  isOpen: boolean;
  mode: WritingMode;
  selectionWordCount: number;
  selectionCharacterCount: number;
  selectionVersion: number;
  panelVersion: number;
  hasSelection: boolean;
  aiEnabled: boolean;
  aiMessage: string;
  remainingTokens: number;
  captureContext: () => CapturedAiContext;
  isContextCurrent: (context: CapturedAiContext) => boolean;
  onReplace: (context: CapturedAiContext, content: string) => void;
  onClose: () => void;
};

const rewriteActions: Array<{
  action: AiAction;
  labelKey: UiTranslationKey;
  descriptionKey: UiTranslationKey;
}> = [
  {
    action: "improveClarity",
    labelKey: "ai.improveClarity",
    descriptionKey: "ai.improveClarityDescription",
  },
  {
    action: "fixGrammar",
    labelKey: "ai.fixGrammar",
    descriptionKey: "ai.fixGrammarDescription",
  },
  {
    action: "makeNatural",
    labelKey: "ai.makeNatural",
    descriptionKey: "ai.makeNaturalDescription",
  },
  {
    action: "makeStronger",
    labelKey: "ai.makeStronger",
    descriptionKey: "ai.makeStrongerDescription",
  },
  {
    action: "makeConcise",
    labelKey: "ai.makeConcise",
    descriptionKey: "ai.makeConciseDescription",
  },
  {
    action: "improveFlow",
    labelKey: "ai.improveFlow",
    descriptionKey: "ai.improveFlowDescription",
  },
];

const actionLabelKeys: Record<AiAction, UiTranslationKey> = {
  improveClarity: "ai.improveClarity",
  fixGrammar: "ai.fixGrammar",
  makeNatural: "ai.makeNatural",
  makeStronger: "ai.makeStronger",
  makeConcise: "ai.makeConcise",
  improveFlow: "ai.improveFlow",
  custom: "ai.askWritely",
};

export default function AiWritingPanel({
  docId,
  isOpen,
  mode,
  selectionWordCount,
  selectionCharacterCount,
  selectionVersion,
  panelVersion,
  hasSelection,
  aiEnabled,
  aiMessage,
  remainingTokens,
  captureContext,
  isContextCurrent,
  onReplace,
  onClose,
}: Props) {
  const router = useRouter();
  const utils = api.useUtils();
  const handleTRPCError = useHandleTRPCError();
  const { locale, t } = useUiLanguage();
  const [result, setResult] = useState<AiResult | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    action: AiAction;
    instruction?: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [requestError, setRequestError] = useState<{
    message: string;
    selectionVersion: number;
    panelVersion: number;
  } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const askAi = api.ai.askAi.useMutation();
  const hasTarget = hasSelection;
  const isSelectionOverLimit =
    selectionCharacterCount > MAX_AI_SELECTION_CHARACTERS;
  const visibleRequestError =
    isOpen &&
    requestError?.selectionVersion === selectionVersion &&
    requestError.panelVersion === panelVersion
      ? requestError.message
      : "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  const runAction = (action: AiAction, instruction?: string) => {
    if (askAi.isPending || !aiEnabled) {
      return;
    }

    const context = captureContext();
    const target = context.selectedText;

    if (!target?.trim()) {
      setRequestError({
        message: t("ai.selectPrompt"),
        selectionVersion,
        panelVersion,
      });
      return;
    }

    if (target.length > MAX_AI_SELECTION_CHARACTERS) {
      setRequestError({
        message: t("ai.selectionLimit", {
          count: MAX_AI_SELECTION_CHARACTERS.toLocaleString(locale),
        }),
        selectionVersion,
        panelVersion,
      });
      return;
    }

    setResult(null);
    setRequestError(null);
    setLastRequest({ action, instruction });

    askAi.mutate(
      {
        docId,
        action,
        mode,
        selectedText: context.selectedText,
        selectedHtml: context.selectedHtml,
        instruction,
      },
      {
        onSuccess: (response) => {
          setResult({ action, context, response });
          void utils.ai.getStatus.invalidate();
        },
        onError: (error) => {
          setRequestError({
            message: error.data?.zodError ? t("error.input") : error.message,
            selectionVersion,
            panelVersion,
          });
          handleTRPCError({ error, router });
        },
      },
    );
  };

  const handleCopy = async () => {
    if (result?.response.type !== "response") {
      return;
    }

    await navigator.clipboard.writeText(result.response.content);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1200);
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
        aria-label={t("ai.closePanel")}
        tabIndex={-1}
        className={`fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-panel-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(100%,420px)] transform-gpu flex-col overflow-hidden border-l border-[var(--w-border)] bg-[var(--w-surface)]/98 shadow-[-24px_0_80px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--w-border-soft)] px-4 py-4">
            <div>
              <p
                id="ai-panel-title"
                className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase"
              >
                {t("ai.panelTitle")}
              </p>
              <p className="mt-1.5 text-xs text-[var(--w-muted)]">
                {hasSelection
                  ? t("ai.selectedText", {
                      count: selectionWordCount.toLocaleString(locale),
                      unit:
                        selectionWordCount === 1 ? t("ai.word") : t("ai.words"),
                    })
                  : t("ai.selectToBegin")}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--w-muted)] transition-colors hover:bg-[var(--w-border-soft)] hover:text-[var(--w-foreground)]"
              aria-label={t("ai.closePanel")}
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          <div className="ai-panel-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-xs leading-relaxed text-[var(--w-muted)]">
              {t("ai.privacy")}
            </p>

            {aiEnabled ? (
              <AiUsageMeter remainingTokens={remainingTokens} />
            ) : (
              <p className="rounded-lg border border-[var(--w-border)] bg-[var(--w-surface-raised)] px-3 py-2 text-xs leading-relaxed text-[var(--w-muted)]">
                {aiMessage}
              </p>
            )}

            {!hasTarget && (
              <p className="rounded-lg border border-[var(--w-border)] bg-[var(--w-surface-raised)] px-3 py-2 text-xs leading-relaxed text-[var(--w-muted)]">
                {t("ai.selectPrompt")}
              </p>
            )}

            {isSelectionOverLimit && (
              <p
                role="alert"
                className="rounded-lg border border-[var(--w-border)] bg-[var(--w-surface-raised)] px-3 py-2 text-xs leading-relaxed text-[var(--w-muted)]"
              >
                {t("ai.selectionLimit", {
                  count: MAX_AI_SELECTION_CHARACTERS.toLocaleString(locale),
                })}
              </p>
            )}

            <section>
              <p className="mb-2 text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
                {t("ai.selectedLabel")}
              </p>
              <div className="flex flex-col gap-2">
                {rewriteActions.map(({ action, labelKey, descriptionKey }) => (
                  <button
                    key={action}
                    onClick={() => runAction(action)}
                    disabled={
                      askAi.isPending ||
                      !hasTarget ||
                      isSelectionOverLimit ||
                      !aiEnabled
                    }
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-[var(--w-border-soft)] bg-[var(--w-background)] px-3.5 py-3 text-left transition-colors duration-200 hover:border-[var(--w-border)] hover:bg-[var(--w-surface-raised)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[var(--w-strong)]">
                        {t(labelKey)}
                      </span>
                      <span className="mt-1.5 block text-xs leading-5 text-[var(--w-muted)]">
                        {t(descriptionKey)}
                      </span>
                    </span>
                    <span className="shrink-0 text-[var(--w-subtle)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--w-muted)]">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section
              className="min-h-32 rounded-xl border border-[var(--w-border-soft)] bg-[var(--w-surface-raised)] p-4"
              aria-live="polite"
            >
              {askAi.isPending ? (
                <div className="flex h-24 items-center justify-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--w-muted)]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--w-muted)] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--w-muted)] [animation-delay:300ms]" />
                </div>
              ) : visibleRequestError ? (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-[var(--w-strong)]">
                    {visibleRequestError}
                  </p>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() =>
                        lastRequest &&
                        runAction(lastRequest.action, lastRequest.instruction)
                      }
                      disabled={
                        !hasTarget || isSelectionOverLimit || !aiEnabled
                      }
                      className="mt-3 cursor-pointer rounded-lg border border-[var(--w-border)] px-3 py-2 text-xs font-medium text-[var(--w-strong)] hover:bg-[var(--w-border-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t("ai.retry")}
                    </button>
                  </div>
                </div>
              ) : result ? (
                <div className="animate-[fadeIn_220ms_ease-out]">
                  <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
                    {t(actionLabelKeys[result.action])}
                  </p>

                  {result.response.type === "rewrite" ? (
                    <AiRewriteComparison
                      original={result.response.original}
                      improved={result.response.improved}
                      changes={result.response.changes}
                    />
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-[var(--w-strong)]">
                      {result.response.content}
                    </p>
                  )}

                  {result.response.type === "rewrite" && !canReplace && (
                    <p className="mt-3 text-xs leading-relaxed text-[#E2A66F]">
                      {t("ai.sourceChanged")}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    {result.response.type === "rewrite" ? (
                      <button
                        onClick={handleReplace}
                        disabled={!canReplace}
                        className="cursor-pointer rounded-lg bg-[var(--w-foreground)] px-3 py-2 text-xs font-medium text-[var(--w-background)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t("ai.replace")}
                      </button>
                    ) : (
                      <button
                        onClick={handleCopy}
                        className="cursor-pointer rounded-lg bg-[var(--w-foreground)] px-3 py-2 text-xs font-medium text-[var(--w-background)]"
                      >
                        {isCopied ? t("ai.copied") : t("ai.copy")}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setResult(null);
                        setLastRequest(null);
                      }}
                      className="cursor-pointer rounded-lg border border-[var(--w-border)] px-3 py-2 text-xs font-medium text-[var(--w-muted)] hover:bg-[var(--w-border-soft)]"
                    >
                      {t("ai.dismiss")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-[var(--w-subtle)]">
                  {t("ai.chooseAction")}
                </p>
              )}
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
