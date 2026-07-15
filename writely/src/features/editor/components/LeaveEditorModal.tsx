import LoadingIcon from "~/components/shared/LoadingIcon";

type Props = {
  isOpen: boolean;
  dontRemindAgain: boolean;
  isSaving: boolean;
  isUpdatingPreference: boolean;
  onDontRemindAgainChange: (checked: boolean) => void;
  onLeave: () => void;
  onSaveAndLeave: () => void;
};

export default function LeaveEditorModal({
  isOpen,
  dontRemindAgain,
  isSaving,
  isUpdatingPreference,
  onDontRemindAgainChange,
  onLeave,
  onSaveAndLeave,
}: Props) {
  if (!isOpen) {
    return null;
  }

  const isProcessing = isSaving || isUpdatingPreference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-editor-title"
        className="w-full max-w-sm rounded-2xl border border-[#262C36] bg-[#12161C] p-7 shadow-2xl"
      >
        <h2
          id="leave-editor-title"
          className="text-base font-medium text-[#F5F5F7]"
        >
          Save before leaving?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#8E96A3]">
          Your latest edits are only kept after you save this draft.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <button
            disabled={isProcessing}
            onClick={onLeave}
            className="cursor-pointer rounded-xl border border-[#2E3643] py-3 text-sm text-[#C8CBD0] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] disabled:cursor-wait disabled:opacity-60"
          >
            Leave page
          </button>
          <button
            disabled={isProcessing}
            onClick={onSaveAndLeave}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5F5F7] py-3 text-sm font-medium text-[#0B0D10] transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoadingIcon />
                <span>Saving...</span>
              </>
            ) : (
              "Save document"
            )}
          </button>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-2 text-xs text-[#8E96A3]">
          <input
            type="checkbox"
            checked={dontRemindAgain}
            disabled={isProcessing}
            onChange={(event) => onDontRemindAgainChange(event.target.checked)}
            className="size-4 rounded border-[#394352] bg-[#0B0D10] accent-[#F5F5F7]"
          />
          Don&apos;t remind me again
        </label>
      </section>
    </div>
  );
}
