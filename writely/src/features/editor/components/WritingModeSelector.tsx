import { WRITING_MODES, type WritingMode } from "~/types/writing";

type Props = {
  selectedMode: WritingMode;
  isSaving: boolean;
  onModeChange: (mode: WritingMode) => void;
};

export default function WritingModeSelector({
  selectedMode,
  isSaving,
  onModeChange,
}: Props) {
  return (
    <div className="w-full">
      <label
        htmlFor="writing-mode"
        className="mb-2 block text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase"
      >
        Writing mode
      </label>
      <div className="relative">
        <select
          id="writing-mode"
          value={selectedMode}
          disabled={isSaving}
          onChange={(event) => onModeChange(event.target.value as WritingMode)}
          title="Writing mode"
          aria-describedby="writing-mode-help"
          className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[var(--w-border-soft)] bg-[var(--w-background)] px-3 pr-9 text-sm text-[var(--w-strong)] transition-colors outline-none hover:border-[var(--w-border)] hover:text-[var(--w-foreground)] focus:border-[var(--w-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)] disabled:cursor-wait disabled:opacity-60"
        >
          {WRITING_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--w-muted)]">
          ▾
        </span>
      </div>
      <p
        id="writing-mode-help"
        className="mt-2 text-xs leading-relaxed text-[var(--w-subtle)]"
      >
        Controls how AI adapts its suggestions for this draft.
      </p>
    </div>
  );
}
