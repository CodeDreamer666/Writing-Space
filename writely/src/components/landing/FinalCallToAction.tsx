import StartWritingButton from "./StartWritingButton";

export default function FinalCallToAction() {
  return (
    <section className="px-5 py-24 text-center sm:px-10 sm:py-[140px]">
      <h2 className="font-display mx-auto max-w-[18ch] text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.02] font-light tracking-[-0.03em]">
        Your next sentence deserves some <em>space</em>
      </h2>
      <div className="mt-12">
        <StartWritingButton>Start writing</StartWritingButton>
      </div>
    </section>
  );
}
