import { WRITING_MODES, type WritingMode } from "~/types/writing";

type Props = {
  selectedMode: WritingMode;
  onModeChange: (mode: WritingMode) => void;
};

export default function WritingModeSelector({
  selectedMode,
  onModeChange,
}: Props) {
  return (
    <div className="w-full">
      <label
        htmlFor="writing-mode"
        className="mb-2 block text-[11px] font-medium tracking-widest text-[#6B7280] uppercase"
      >
        Writing mode
      </label>
      <div className="relative">
        <select
          id="writing-mode"
          value={selectedMode}
          onChange={(event) => onModeChange(event.target.value as WritingMode)}
          title="Writing mode"
          aria-describedby="writing-mode-help"
          className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#1E2530] bg-[#0B0D10] px-3 pr-9 text-sm text-[#D5D9DF] transition-colors outline-none hover:border-[#2E3643] hover:text-[#F5F5F7] focus:border-[#555C6A]"
        >
          {WRITING_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#8E96A3]">
          ▾
        </span>
      </div>
      <p
        id="writing-mode-help"
        className="mt-2 text-xs leading-relaxed text-[#6B7280]"
      >
        Controls how AI adapts its suggestions for this draft.
      </p>
    </div>
  );
}
