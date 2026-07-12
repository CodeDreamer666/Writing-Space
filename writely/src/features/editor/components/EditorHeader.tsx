type Props = {
  isAiOpen: boolean;
  isFocusMode: boolean;
  onAiToggle: () => void;
  onFocusToggle: () => void;
};

export default function EditorHeader({
  isAiOpen,
  isFocusMode,
  onAiToggle,
  onFocusToggle,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1E2530]/70 bg-[#0B0D10]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2A313C] text-[10px] font-medium text-[#AEB4BE]">
            W
          </span>
          <span className="text-xs tracking-[0.12em] uppercase">Writely</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFocusToggle}
            className={`h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] ${
              isFocusMode
                ? "bg-[#F5F5F7] text-[#0B0D10]"
                : "text-[#8E96A3] hover:bg-[#161B22] hover:text-[#F5F5F7]"
            }`}
          >
            {isFocusMode ? "Exit focus" : "Focus mode"}
          </button>

          {!isFocusMode && (
            <button
              onClick={onAiToggle}
              className={`h-8 cursor-pointer rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] ${
                isAiOpen
                  ? "border-[#555C6A] bg-[#F5F5F7] text-[#0B0D10]"
                  : "border-[#2A313C] bg-[#121820] text-[#D5D9DF] hover:border-[#394352] hover:text-[#F5F5F7]"
              }`}
            >
              AI
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
