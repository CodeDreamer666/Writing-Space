import StartWritingButton from "./StartWritingButton";

export default function LandingHeader() {
  return (
    <header className="flex items-center justify-between border-b border-(--w-border-soft) px-5 py-5 sm:px-10 sm:py-7">
      <div className="flex items-baseline gap-3.5">
        <span className="font-mono-label text-[13px] tracking-[0.34em] uppercase">
          Writely
        </span>
      </div>
      <StartWritingButton variant="header">Start writing</StartWritingButton>
    </header>
  );
}
