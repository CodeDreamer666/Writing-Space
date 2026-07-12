import Link from "next/link";

export type EditorSaveStatus =
  | "idle"
  | "unsaved"
  | "saving"
  | "saved"
  | "failed";

type Props = {
  wordCount: number;
  readingTime: string;
  saveStatus: EditorSaveStatus;
  shortcutHint: string;
};

const saveStatusLabels: Record<Exclude<EditorSaveStatus, "idle">, string> = {
  unsaved: "Unsaved changes",
  saving: "Saving...",
  saved: "Saved",
  failed: "Save failed",
};

export default function EditorUtilityBar({
  wordCount,
  readingTime,
  saveStatus,
  shortcutHint,
}: Props) {
  const saveMessage =
    saveStatus === "idle" ? shortcutHint : saveStatusLabels[saveStatus];

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <footer className="flex items-center justify-between border-t border-[#1E2530] pt-4 text-xs text-[#8E96A3]">
        <Link
          href="/"
          className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-2 text-[#AEB4BE] transition-colors hover:bg-[#161B22] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
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
          <span>Back to drafts</span>
        </Link>

        <p className="px-2 text-[#6B7280] md:justify-self-center">
          {wordCount.toLocaleString()} words · {readingTime}
        </p>

        <p
          className={`px-2 text-xs transition-opacity duration-300 md:justify-self-end ${
            saveStatus === "failed" ? "text-[#E2A66F]" : "text-[#6B7280]"
          }`}
          aria-live="polite"
        >
          {saveMessage}
        </p>
      </footer>
    </div>
  );
}
