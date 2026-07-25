"use client";

import { useUiLanguage } from "~/hooks/useUiLanguage";

type Props = {
  wordCount: number;
  readingTime: string;
  onBackToDrafts: () => void;
};

export default function EditorUtilityBar({
  wordCount,
  readingTime,
  onBackToDrafts,
}: Props) {
  const { locale, t } = useUiLanguage();

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--w-border-soft)] pt-4 text-xs text-[var(--w-muted)]">
        <button
          onClick={onBackToDrafts}
          className="inline-flex min-h-9 w-fit cursor-pointer items-center gap-2 rounded-lg px-2 text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{t("editor.backDrafts")}</span>
        </button>

        <p className="px-2 text-right text-[var(--w-subtle)]">
          {t("editor.words", { count: wordCount.toLocaleString(locale) })} ·{" "}
          {readingTime}
        </p>
      </footer>
    </div>
  );
}
