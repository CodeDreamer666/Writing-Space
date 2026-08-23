import StartWritingButton from "./StartWritingButton";
import ToolbarPreview from "./ToolbarPreview";

export default function Hero() {
  return (
    <section className="grid border-b border-(--w-border-soft) lg:grid-cols-2">
      <div className="flex flex-col justify-center border-b border-(--w-border-soft) px-5 py-12 sm:px-10">
        <p className="font-mono-label mb-10 text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase">
          01 — The page
        </p>
        <h1 className="font-display text-[clamp(3rem,6.4vw,6.5rem)] leading-[0.98] font-light tracking-[-0.03em] text-balance">
          A quieter place
          <br />
          <em>to write</em>
        </h1>
        <p className="mt-9 max-w-[42ch] text-[17px] leading-[1.7] text-(--w-muted)">
          Writely keeps everything out of your way so you can think clearly. AI
          only sees what you choose—never your whole document.
        </p>
        <div className="mt-11 flex flex-wrap items-center gap-5">
          <StartWritingButton>Start writing</StartWritingButton>
        </div>
      </div>
      <div className="flex items-center justify-center bg-(--w-surface) px-5 py-12 sm:px-10 sm:py-14">
        <div className="w-full max-w-[520px] border border-(--w-border) bg-(--w-background)">
          <div className="flex items-center justify-between border-b border-(--w-border-soft) px-[18px] py-3.5">
            <span className="flex w-4 flex-col gap-[3px]" aria-hidden="true">
              <i className="h-px bg-(--w-foreground)" />
              <i className="h-px bg-(--w-foreground)" />
              <i className="h-px bg-(--w-foreground)" />
            </span>
            <span className="font-mono-label text-[10px] tracking-[0.18em] text-(--w-subtle) uppercase">
              Saved
            </span>
          </div>
          <div className="px-5 py-9 sm:px-7 sm:pt-[46px] sm:pb-[34px]">
            <ToolbarPreview />
            <p className="font-display text-[clamp(1.3rem,2.4vw,1.85rem)] leading-[1.45] font-light">
              The first clear sentence gives{" "}
              <span className="bg-(--w-foreground) px-0.5 text-(--w-background)">
                the rest of the thought
              </span>{" "}
              somewhere to go.
            </p>
          </div>
          <p className="font-mono-label border-t border-(--w-border-soft) px-[18px] py-4 text-center text-[10px] tracking-[0.14em] uppercase">
            AI only receives the selected passage
          </p>
        </div>
      </div>
    </section>
  );
}
