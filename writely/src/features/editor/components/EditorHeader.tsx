import LoadingIcon from "~/components/shared/LoadingIcon";

type Props = {
  isAiOpen: boolean;
  isSaving: boolean;
  onSave: () => void;
  onAiToggle: () => void;
};

export default function EditorHeader({
  isAiOpen,
  isSaving,
  onSave,
  onAiToggle,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1E2530]/70 bg-[#0B0D10]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2A313C] text-[10px] font-medium text-[#AEB4BE]">
            W
          </span>
          <span className="hidden text-xs tracking-[0.12em] uppercase sm:inline">
            Writely
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isSaving}
            onClick={onSave}
            aria-label="Save draft now"
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-[#2A313C] bg-[#121820] px-3 text-xs font-medium text-[#D5D9DF] transition-colors hover:border-[#394352] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoadingIcon />
                <span>Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </button>

          <button
            onClick={onAiToggle}
            aria-label={isAiOpen ? "Close AI panel" : "Open AI panel"}
            aria-expanded={isAiOpen}
            className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] ${
              isAiOpen
                ? "border-[#555C6A] bg-[#F5F5F7] text-[#0B0D10]"
                : "border-[#2A313C] bg-[#121820] text-[#D5D9DF] hover:border-[#394352] hover:text-[#F5F5F7]"
            }`}
          >
            AI
          </button>
        </div>
      </div>
    </header>
  );
}
