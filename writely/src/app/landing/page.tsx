import type { Metadata } from "next";
import Link from "next/link";
import {
  AiRewriteDemo,
  AutosaveDemo,
  EditorPreview,
  ExportDemo,
  FocusModeDemo,
} from "./LandingDemos";
import LandingNavAction from "./LandingNavAction";

export const metadata: Metadata = {
  title: "A quieter place to write",
  description:
    "Writely is a focused writing app with autosave, keyboard-first controls, and optional AI help for selected text.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--w-background)] text-[var(--w-foreground)]">
      <div className="mx-auto max-w-6xl px-12">
        <header className="flex items-center justify-between border-b border-[var(--w-border-soft)] py-5">
          <Link
            href="/landing"
            className="flex items-center gap-3 text-sm font-medium tracking-[0.14em] text-[var(--w-strong)] uppercase"
            aria-label="Writely home"
          >
            <span className="flex size-9 items-center justify-center rounded-md border border-[var(--w-border)] text-base tracking-normal normal-case">
              W
            </span>
            Writely
          </Link>
          <LandingNavAction />
        </header>

        <section className="grid items-center gap-12 py-16 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
              Writing, with less around it
            </p>
            <h1 className="mt-5 text-5xl leading-[1.02] font-medium tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
              Stay with the words.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--w-muted)]">
              A focused editor that saves as you write and brings in AI only
              when you select the text.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--w-foreground)] px-5 text-sm font-medium text-[var(--w-background)] transition-opacity hover:opacity-85"
            >
              Start writing
            </Link>
          </div>

          <EditorPreview />
        </section>

        <section className="border-t border-[var(--w-border-soft)] py-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
                Selected-text AI
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                See the change before it touches your draft.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--w-muted)]">
                Compare the original and rewrite. Replace it only when it still
                fits your voice.
              </p>
            </div>
          </div>

          <AiRewriteDemo />
        </section>

        <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[0.84fr_1.16fr]">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
              Focus Mode
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Give the sentence the whole room.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--w-muted)]">
              Fade the surrounding interface when you want to stay with one
              clear page.
            </p>
          </div>

          <FocusModeDemo expanded />
        </section>

        <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[1.16fr_0.84fr]">
          <div className="lg:order-2">
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
              Autosave
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Keep writing. Saving stays quiet.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--w-muted)]">
              See each change save automatically, with a recovery copy ready if
              the connection drops.
            </p>
          </div>

          <div className="lg:order-1">
            <AutosaveDemo expanded />
          </div>
        </section>

        <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[0.84fr_1.16fr]">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
              Export
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Take the finished draft with you.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--w-muted)]">
              Preview the document, then choose the format that fits what comes
              next.
            </p>
          </div>

          <ExportDemo expanded />
        </section>

        <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs text-[var(--w-subtle)]">
                <span>Full document</span>
                <span>Private</span>
              </div>
              <div className="mt-8 space-y-3">
                <div className="h-4 w-3/4 rounded bg-[var(--w-foreground)]/12" />
                <div className="h-3 w-full rounded bg-[var(--w-foreground)]/8" />
                <div className="flex h-6 w-5/6 items-center rounded bg-[var(--w-foreground)] px-2 text-[9px] text-[var(--w-background)]">
                  Only this selected passage
                </div>
                <div className="h-3 w-2/3 rounded bg-[var(--w-foreground)]/8" />
              </div>
            </div>
            <div className="absolute -right-3 -bottom-5 w-36 rounded-xl border border-[var(--w-border)] bg-[var(--w-surface-raised)] p-3 shadow-xl sm:-right-8">
              <p className="text-[9px] tracking-wider text-[var(--w-subtle)] uppercase">
                Sent to AI
              </p>
              <p className="mt-2 text-[10px] leading-4 text-[var(--w-strong)]">
                Only this selected passage
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
              Private by intent
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Your writing stays yours.
            </h2>
            <ul className="mt-7 space-y-4 text-sm leading-7 text-[var(--w-muted)]">
              <li>
                Only the text you select is sent when you choose an AI action.
              </li>
              <li>
                Recent unsaved writing can be recovered from your browser.
              </li>
              <li>
                Writely has no public feed, audience, or collaboration layer.
              </li>
            </ul>
            <Link
              href="/privacy"
              className="mt-7 inline-flex text-sm font-medium text-[var(--w-strong)] underline decoration-[var(--w-subtle)] underline-offset-4"
            >
              Privacy in plain language
            </Link>
          </div>
        </section>

        <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="max-w-xl">
            <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Ready to stay with the words?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--w-muted)]">
              Write in a quiet space with autosave always working and optional
              AI help for the text you choose.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--w-foreground)] px-5 text-sm font-medium text-[var(--w-background)] transition-opacity hover:opacity-85"
            >
              Start writing
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] shadow-2xl shadow-black/15">
            <div className="flex items-center justify-between border-b border-[var(--w-border-soft)] px-4 py-3 text-[11px] text-[var(--w-subtle)]">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[var(--w-foreground)]" />
                Focus Mode
              </span>
              <span>Saved</span>
            </div>
            <div className="px-6 py-9 sm:px-10 sm:py-12">
              <p className="text-sm font-medium text-[var(--w-foreground)]">
                A finished thought
              </p>
              <div className="mt-5 max-w-xl space-y-4 text-base leading-8 text-[var(--w-muted)] sm:text-lg">
                <p>
                  The work becomes clearer when there is enough room to follow
                  the idea to its natural end.
                </p>
                <p>
                  Keep the page quiet, save the thought, and return with a <span className="rounded bg-[var(--w-foreground)]/10 px-1 text-[var(--w-foreground)]">clearer next sentence.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-[var(--w-border-soft)] py-8 text-sm text-[var(--w-subtle)]">
          <span>Writely</span>
          <Link href="/setting" className="hover:text-[var(--w-foreground)]">
            Settings &amp; Help
          </Link>
        </footer>
      </div>
    </main>
  );
}
