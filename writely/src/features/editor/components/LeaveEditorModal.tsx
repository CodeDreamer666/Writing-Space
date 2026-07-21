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
        className="w-full max-w-sm rounded-2xl border border-[var(--w-border-soft)] bg-[var(--w-surface)] p-7 shadow-2xl"
      >
        <h2
          id="leave-editor-title"
          className="text-base font-medium text-[var(--w-foreground)]"
        >
          Save before leaving?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--w-muted)]">
          Your latest edits are only kept after you save this draft.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <button
            disabled={isProcessing}
            onClick={onLeave}
            className="cursor-pointer rounded-xl border border-[var(--w-border)] py-3 text-sm text-[var(--w-strong)] transition-colors hover:bg-[var(--w-border-soft)] hover:text-[var(--w-foreground)] disabled:cursor-wait disabled:opacity-60"
          >
            Leave page
          </button>
          <button
            disabled={isProcessing}
            onClick={onSaveAndLeave}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--w-foreground)] py-3 text-sm font-medium text-[var(--w-background)] transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
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

        <label className="mt-5 flex cursor-pointer items-center gap-2 text-xs text-[var(--w-muted)]">
          <input
            type="checkbox"
            checked={dontRemindAgain}
            disabled={isProcessing}
            onChange={(event) => onDontRemindAgainChange(event.target.checked)}
            className="size-4 rounded border-[var(--w-border)] bg-[var(--w-background)] accent-[var(--w-foreground)]"
          />
          Don&apos;t remind me again
        </label>
      </section>
    </div>
  );
}
