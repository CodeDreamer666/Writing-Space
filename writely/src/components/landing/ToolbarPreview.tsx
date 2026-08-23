export default function ToolbarPreview() {
  return (
    <div
      aria-hidden="true"
      className="mb-[30px] inline-flex h-[46px] max-w-full items-center gap-4 border border-(--w-border) bg-(--w-surface-raised) px-3 sm:gap-[22px] sm:px-4"
    >
      <b className="text-[13px]">B</b>
      <i className="font-display text-[13px]">I</i>
      <b className="text-[13px]">H</b>
      <span className="text-sm">≡</span>
      <span className="font-display text-[19px]">“</span>
      <span className="font-mono-label bg-(--w-foreground) px-2 py-1 text-[10px] tracking-[0.14em] text-(--w-background)">
        AI
      </span>
    </div>
  );
}
