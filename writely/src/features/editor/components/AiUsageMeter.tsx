"use client";

import { useUiLanguage } from "~/hooks/useUiLanguage";
import { DAILY_AI_TOKEN_LIMIT } from "~/lib/aiLimits";

export function getAiRemainingPercentage(remainingTokens: number) {
  const safeRemainingTokens = Math.min(
    DAILY_AI_TOKEN_LIMIT,
    Math.max(0, remainingTokens),
  );

  return Math.min(
    100,
    Math.max(0, Math.round((safeRemainingTokens / DAILY_AI_TOKEN_LIMIT) * 100)),
  );
}

export default function AiUsageMeter({
  remainingTokens,
}: {
  remainingTokens: number;
}) {
  const { t } = useUiLanguage();
  const remainingPercentage = getAiRemainingPercentage(remainingTokens);

  return (
    <div className="rounded-xl border border-[var(--w-border)] bg-[var(--w-surface-raised)] px-3.5 py-3">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-[var(--w-strong)]">
          {t("ai.usageToday")}
        </span>
        <span className="text-[var(--w-muted)]">
          {t("ai.percentLeft", { count: remainingPercentage })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t("ai.allowanceRemaining")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={remainingPercentage}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--w-border)]"
      >
        <div
          className="h-full rounded-full bg-[var(--w-foreground)] transition-[width] duration-300"
          style={{ width: `${remainingPercentage}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-[var(--w-subtle)]">
        {t("ai.resetsTomorrow")}
      </p>
    </div>
  );
}
