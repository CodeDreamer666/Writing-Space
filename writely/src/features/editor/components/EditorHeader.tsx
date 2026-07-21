import LoadingIcon from "~/components/shared/LoadingIcon";

type Props = {
  saveBlockedReason: "conflict" | "recovery" | null;
  isSaving: boolean;
  onSave: () => void;
};

export default function EditorHeader({
  saveBlockedReason,
  isSaving,
  onSave,
}: Props) {
  const saveButtonLabel = saveBlockedReason
    ? saveBlockedReason === "recovery"
      ? "Choose whether to restore the browser recovery copy before saving"
      : "Resolve the version conflict below before saving"
    : "Save draft now";

  return (
    <header className="sticky max-w-4xl mx-auto top-0 z-30 border-b border-[#1E2530]/70 bg-[#0B0D10]/85 backdrop-blur-xl">
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
            disabled={isSaving || saveBlockedReason !== null}
            onClick={onSave}
            aria-label={saveButtonLabel}
            title={saveButtonLabel}
            className={`flex h-8 cursor-pointer items-center gap-2 rounded-md border border-[#2A313C] bg-[#121820] px-3 text-xs font-medium text-[#D5D9DF] transition-colors hover:border-[#394352] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] disabled:opacity-60 ${saveBlockedReason ? "disabled:cursor-not-allowed" : "disabled:cursor-wait"}`}
          >
            {isSaving ? (
              <>
                <LoadingIcon />
                <span>Saving...</span>
              </>
            ) : saveBlockedReason ? (
              saveBlockedReason === "recovery" ? (
                "Choose recovery"
              ) : (
                "Resolve conflict"
              )
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
