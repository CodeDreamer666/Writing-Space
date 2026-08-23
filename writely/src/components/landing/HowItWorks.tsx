"use client";
import { useState } from "react";
import ChoiceButton from "./ChoiceButton";

const steps = [
  {
    number: "01",
    title: "Write",
    description: "Put your thoughts on the page without distractions",
  },
  {
    number: "02",
    title: "Select",
    description:
      "Highlight what matters. Writely reveals tools and AI, right where you need them",
  },
  {
    number: "03",
    title: "Decide",
    description:
      "Compare the suggestion with your words and choose with confidence",
  },
];

export default function HowItWorks() {
  const [demoChoice, setDemoChoice] = useState<"suggestion" | "original">(
    "suggestion",
  );

  return (
    <section className="border-b border-(--w-border-soft) px-5 py-16 sm:px-10 sm:py-[88px]">
      <p className="font-mono-label mb-10 text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase">
        02 — How it works
      </p>
      <h2 className="font-display max-w-[20ch] text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.04] font-light tracking-[-0.03em]">
        The interface waits for <em>you</em>
      </h2>
      <p className="mt-3 max-w-[48ch] text-[17px] leading-[1.7] text-(--w-muted)">
        Writely stays out of your way—until you need it. Then it helps you say
        it, clearly.
      </p>
      <div className="mt-12 grid border-t border-(--w-border-soft) sm:mt-16 lg:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.number}
            className="border-b border-(--w-border-soft) py-8 lg:border-r lg:border-b-0 lg:pr-8 last:lg:border-r-0 [&+article]:lg:pl-8"
          >
            <div className="flex items-baseline gap-[18px]">
              <span className="font-mono-label text-[11px] tracking-[0.16em] text-(--w-subtle)">
                {step.number}
              </span>
              <h3 className="font-display text-[30px] leading-none font-normal">
                {step.title}
              </h3>
            </div>
            <p className="mt-5 ml-[41px] max-w-[34ch] text-[15px] leading-[1.75] text-(--w-muted)">
              {step.description}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-12 border border-(--w-border) bg-(--w-surface) px-5 py-8 sm:mt-16 sm:px-8 sm:py-9">
        <p className="font-mono-label mb-6 text-[11px] tracking-[0.18em] text-(--w-subtle) uppercase">
          Writely suggests
        </p>
        <p className="font-display min-h-[2.8em] max-w-[32ch] text-[clamp(1.3rem,2.6vw,2rem)] leading-[1.4] font-light">
          {demoChoice === "suggestion"
            ? "A small idea becomes clearer when the page steps aside and lets it breathe"
            : "A small idea becomes clearer when the page leaves it alone"}
        </p>
        <div className="mt-8 flex w-fit border border-(--w-border)">
          <ChoiceButton
            active={demoChoice === "suggestion"}
            onClick={() => setDemoChoice("suggestion")}
          >
            Use suggestion
          </ChoiceButton>
          <ChoiceButton
            active={demoChoice === "original"}
            onClick={() => setDemoChoice("original")}
          >
            Keep mine
          </ChoiceButton>
        </div>
      </div>
    </section>
  );
}
