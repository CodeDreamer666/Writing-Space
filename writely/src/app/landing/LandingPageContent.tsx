import Link from "next/link";
import { LegalLinks } from "~/components/layout/LegalLinks";
import LandingNavAction from "./LandingNavAction";

const principles = [
  {
    number: "01",
    title: "Quiet by default",
    description: "A clean page that keeps the next sentence in view.",
  },
  {
    number: "02",
    title: "Saved as you write",
    description: "Autosave and a local recovery copy protect unfinished work.",
  },
  {
    number: "03",
    title: "AI stays in its place",
    description: "It only sees the passage you select when you ask for help.",
  },
] as const;

export default function LandingPageContent() {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[var(--w-background)] text-[var(--w-foreground)]">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        <header className="flex min-h-20 items-center justify-between border-b border-[var(--w-border-soft)]">
          <Link
            href="/"
            aria-label="Writely home"
            className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-[var(--w-strong)] uppercase"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-[var(--w-border)] bg-[var(--w-surface)] text-base tracking-normal normal-case shadow-sm">
              W
            </span>
            Writely
          </Link>
          <LandingNavAction />
        </header>

        <section className="grid items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 text-[11px] font-medium tracking-[0.18em] text-[var(--landing-accent)] uppercase">
              <span className="size-1.5 rounded-full bg-[var(--landing-accent)]" />
              Your private writing space
            </p>
            <h1 className="mt-6 text-6xl leading-[0.98] font-medium tracking-[-0.055em] text-balance lg:text-7xl">
              Give ideas{" "}
              <span className="font-serif font-normal text-[var(--landing-accent)] italic">
                room
              </span>
            </h1>
            <p className="mt-7 text-lg leading-8 text-[var(--w-muted)]">
              Writely keeps the page calm, saves every change, and brings in AI
              only for the words you choose.
            </p>
            <Link
              href="/app"
              className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-6 text-sm font-medium text-[var(--w-background)] shadow-lg shadow-black/10 transition-opacity hover:opacity-90"
            >
              Start a private draft
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex items-center justify-between text-xs text-[var(--w-subtle)]">
              <span>Untitled</span>
              <span>Saved</span>
            </div>
            <div className="mx-auto min-h-72 max-w-xl pt-12 font-serif text-[var(--w-strong)]">
              <p className="text-3xl leading-tight">A quieter place to think</p>
              <p className="mt-6 text-lg leading-8 text-[var(--w-muted)]">
                Some thoughts arrive softly. Writely gives them room before the
                rest of the interface asks for attention.
              </p>
            </div>
          </div>
        </section>

        <section className="grid border-y border-[var(--w-border-soft)] lg:grid-cols-3">
          {principles.map((principle, index) => (
            <article
              key={principle.number}
              className={`py-7 lg:px-8 ${
                index > 0
                  ? "border-t border-[var(--w-border-soft)] lg:border-t-0 lg:border-l"
                  : "lg:pl-0"
              }`}
            >
              <div className="flex items-start gap-5">
                <span className="font-serif text-lg text-[var(--landing-accent)] italic">
                  {principle.number}
                </span>
                <div>
                  <h2 className="text-sm font-medium text-[var(--w-strong)]">
                    {principle.title}
                  </h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--w-subtle)]">
                    {principle.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-12 py-20 lg:grid-cols-3">
          <article>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[var(--landing-accent)] uppercase">
              Selected-text AI
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
              Improve a passage without sharing the whole draft.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--w-muted)]">
              Compare the rewrite with your original and replace it only when it
              still sounds like you.
            </p>
          </article>
          <article>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[var(--landing-accent)] uppercase">
              Autosave and recovery
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
              Keep writing. Saving stays quiet.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--w-muted)]">
              Every change is saved, with a recent browser recovery copy ready
              when the connection is not.
            </p>
          </article>
          <article>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[var(--landing-accent)] uppercase">
              Export
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
              Take the finished draft with you.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--w-muted)]">
              Export your writing as TXT, Markdown, Word, or PDF.
            </p>
          </article>
        </section>

        <section className="border-t border-[var(--w-border-soft)] py-20">
          <div className="rounded-3xl border border-[var(--landing-accent)]/35 bg-[var(--landing-accent-soft)] px-8 py-12 sm:px-12 lg:flex lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-serif text-lg text-[var(--landing-accent)] italic">
                One clear page. One thought at a time.
              </p>
              <h2 className="mt-4 text-4xl leading-tight font-medium tracking-[-0.045em] lg:text-5xl">
                Your next sentence deserves a quieter place.
              </h2>
            </div>
            <Link
              href="/app"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-6 text-sm font-medium text-[var(--w-background)] transition-opacity hover:opacity-90 lg:mt-0"
            >
              Start writing
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-[var(--w-border-soft)] py-8 text-sm text-[var(--w-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <span>Writely · Beta</span>
          <LegalLinks />
        </footer>
      </div>
    </main>
  );
}
