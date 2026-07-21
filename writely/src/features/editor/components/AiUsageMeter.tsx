import { DAILY_AI_TOKEN_LIMIT } from "~/lib/aiLimits";

export function getAiUsagePercentage(remainingTokens: number) {
  const usedTokens = DAILY_AI_TOKEN_LIMIT - Math.max(0, remainingTokens);

  return Math.min(
    100,
    Math.max(0, Math.round((usedTokens / DAILY_AI_TOKEN_LIMIT) * 100)),
  );
}

export default function AiUsageMeter({
  remainingTokens,
}: {
  remainingTokens: number;
}) {
  const percentage = getAiUsagePercentage(remainingTokens);

  return (
    <div className="rounded-xl border border-[var(--w-border)] bg-[var(--w-surface-raised)] px-3.5 py-3">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-[var(--w-strong)]">
          AI usage today
        </span>
        <span className="text-[var(--w-muted)]">{percentage}% used</span>
      </div>
      <div
        role="progressbar"
        aria-label="AI usage today"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--w-border)]"
      >
        <div
          className="h-full rounded-full bg-[var(--w-foreground)] transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-[var(--w-subtle)]">Resets tomorrow</p>
    </div>
  );
}
