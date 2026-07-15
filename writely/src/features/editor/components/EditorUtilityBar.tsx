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
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1E2530] pt-4 text-xs text-[#8E96A3]">
        <button
          onClick={onBackToDrafts}
          className="inline-flex min-h-9 w-fit cursor-pointer items-center gap-2 rounded-lg px-2 text-[#AEB4BE] transition-colors hover:bg-[#161B22] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
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
        </button>

        <p className="px-2 text-right text-[#6B7280]">
          {wordCount.toLocaleString()} words · {readingTime}
        </p>
      </footer>
    </div>
  );
}
