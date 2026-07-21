import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A quieter place to write",
  description:
    "Writely is a focused writing app with autosave, keyboard-first controls, and optional AI help for selected text.",
};

type FeatureIconName = "focus" | "sparkle" | "save";

const features: {
  icon: FeatureIconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "focus",
    title: "Focus mode",
    description:
      "A writing space with only the tools you need, so the work can stay in front of you.",
  },
  {
    icon: "sparkle",
    title: "AI, only when invited",
    description:
      "Select a passage when you want help refining it. Your whole document stays out of the request.",
  },
  {
    icon: "save",
    title: "Always saving",
    description:
      "Your changes save as you write, with a local recovery copy ready if a tab closes at the wrong time.",
  },
];

function FeatureIcon({ name }: { name: FeatureIconName }) {
  const paths = {
    focus: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h11l3 3v15H5V3Z" />
        <path d="M8 3v6h8V3m-8 18v-7h8v7" />
      </>
    ),
  };

  return (
    <span className="flex size-10 items-center justify-center rounded-lg border border-[#36404D] bg-[#151B22] text-[#D5D9DF]">
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        {paths[name]}
      </svg>
    </span>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0B0D10] text-[#F5F5F7]">
      <div className="mx-auto max-w-6xl px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#1E2530] py-6">
          <Link
            href="/landing"
            className="flex items-center gap-3 text-sm font-medium tracking-[0.14em] text-[#D5D9DF] uppercase"
            aria-label="Writely home"
          >
            <span className="flex size-9 items-center justify-center rounded-md border border-[#394352] font-sans text-base tracking-normal text-[#F5F5F7] normal-case">
              W
            </span>
            Writely
          </Link>
          <Link
            href="/"
            className="text-sm text-[#AEB4BE] transition-colors hover:text-[#F5F5F7]"
          >
            Open app
          </Link>
        </header>

        <section className="grid min-h-[540px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#8E96A3] uppercase">
              A calmer way to write
            </p>
            <h1 className="mt-5 text-5xl leading-[1.04] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
              Make room for your{" "}
              <em className="font-serif font-semibold">next thought.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#AEB4BE]">
              Writely is a quiet place for the work of writing: a focused
              editor, dependable autosave, and optional help when you select the
              words you want to improve.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#F5F5F7] px-5 text-sm font-medium text-[#0B0D10] transition-opacity hover:opacity-85"
              >
                Start writing
              </Link>
              <span className="text-sm text-[#6B7280]">Free to begin</span>
            </div>
          </div>

          <div className="border border-[#2A313C] bg-[#10151B] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#252C36] pb-5 text-xs text-[#6B7280]">
              <span>Untitled note</span>
              <span className="text-[#AEB4BE]">Saved just now</span>
            </div>
            <div className="py-12 sm:py-14">
              <p className="max-w-md text-2xl leading-[1.45] font-normal tracking-[-0.025em] text-[#E5E7EA] sm:text-3xl">
                The best writing tools know when to get out of the way.
                <span className="ml-1 inline-block h-7 w-0.5 translate-y-1 bg-[#AEB4BE]" />
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-[#252C36] pt-5 text-xs text-[#6B7280]">
              <span>1 selected sentence</span>
              <span>⌘ K for assistance</span>
            </div>
          </div>
        </section>

        <section
          className="border-t border-[#1E2530] py-16 lg:py-20"
          aria-labelledby="made-for-writing"
        >
          <p className="text-xs font-medium tracking-[0.16em] text-[#8E96A3] uppercase">
            Made for writing
          </p>
          <h2
            id="made-for-writing"
            className="mt-4 max-w-2xl text-3xl leading-tight font-medium tracking-[-0.035em] sm:text-4xl"
          >
            A few thoughtful details. Nothing demanding your attention.
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="border-t border-[#2A313C] pt-5"
              >
                <FeatureIcon name={feature.icon} />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#AEB4BE]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-[#1E2530] py-16 lg:grid-cols-2 lg:gap-20 lg:py-20">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[#8E96A3] uppercase">
              Keep your work yours
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-medium tracking-[-0.035em] sm:text-4xl">
              Export when your words need to go somewhere else.
            </h2>
          </div>
          <div className="space-y-8 text-base leading-8 text-[#AEB4BE]">
            <p>
              Take a finished document with you in a standard format, without
              turning your writing space into a publishing workflow.
            </p>
            <p>
              Writely keeps AI help deliberately narrow: only text you select is
              sent for a response. Read the plain-language privacy details
              whenever you need them.
            </p>
            <Link
              href="/privacy"
              className="inline-flex text-sm font-medium text-[#E5E7EA] underline decoration-[#566171] underline-offset-4 transition-colors hover:text-white"
            >
              Read our privacy approach
            </Link>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-[#1E2530] py-8 text-sm text-[#6B7280]">
          <span>Writely</span>
          <Link
            href="/privacy"
            className="transition-colors hover:text-[#D5D9DF]"
          >
            Privacy
          </Link>
        </footer>
      </div>
    </main>
  );
}
