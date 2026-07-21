import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A quieter place to write",
  description:
    "Writely is a focused writing app with autosave, keyboard-first controls, and optional AI help for selected text.",
};

const formatButtons = ["H1", "H2", "Bold", "Italic", "List"];
const exportFormats = ["TXT", "Markdown", "PDF", "Word"];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--w-background)] text-[var(--w-foreground)]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
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
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
          >
            Open app
          </Link>
        </header>

        <section className="grid items-center gap-12 py-16 lg:min-h-[700px] lg:grid-cols-[0.84fr_1.16fr] lg:py-20">
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

        <section className="border-t border-[var(--w-border-soft)] py-16 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
                Selected-text AI
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                See the change before it touches your draft.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[var(--w-muted)]">
              Compare the original and rewrite. Replace it only when it still
              fits your voice.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] lg:grid-cols-[1fr_1fr_250px]">
            <WritingSample
              label="Original"
              text="The meeting was long and there were many different things that we discussed together."
            />
            <WritingSample
              label="More concise"
              text="The meeting ran long as we worked through several topics."
              improved
            />
            <div className="border-t border-[var(--w-border-soft)] p-5 lg:border-t-0 lg:border-l">
              <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
                Selected text
              </p>
              {["Improve clarity", "Make more concise", "Improve flow"].map(
                (action, index) => (
                  <div
                    key={action}
                    className={
                      index === 1
                        ? "mt-3 rounded-lg border border-[var(--w-foreground)] bg-[var(--w-foreground)] px-3 py-3 text-sm text-[var(--w-background)]"
                        : "mt-3 rounded-lg border border-[var(--w-border)] px-3 py-3 text-sm text-[var(--w-muted)]"
                    }
                  >
                    {action}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-[var(--w-border-soft)] py-16 md:grid-cols-3 lg:py-24">
          <FeaturePanel title="Focus Mode" shortcut="⌘ ⇧ F">
            <div className="mt-7 rounded-xl border border-[var(--w-border)] bg-[var(--w-background)] p-4">
              <div className="flex items-center justify-between text-[10px] text-[var(--w-subtle)]">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[var(--w-subtle)]" />
                  Focus Mode
                </span>
                <span>Saved</span>
              </div>
              <p className="mx-auto mt-10 max-w-[210px] text-lg leading-8">
                One clear page. Nothing competing with the sentence.
              </p>
              <div className="h-9" />
            </div>
          </FeaturePanel>

          <FeaturePanel title="Autosave" shortcut="⌘ S">
            <div className="mt-7 space-y-3">
              {[
                ["Typing", "Saving…"],
                ["Up to date", "Saved"],
                ["Network issue", "Recovery copy kept"],
              ].map(([label, state], index) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] px-3 py-3 text-xs"
                >
                  <span className="text-[var(--w-subtle)]">{label}</span>
                  <span className="flex items-center gap-2 text-[var(--w-strong)]">
                    <span
                      className={
                        index === 2
                          ? "size-1.5 rounded-full bg-[#C96F5B]"
                          : "size-1.5 rounded-full bg-[var(--w-foreground)]"
                      }
                    />
                    {state}
                  </span>
                </div>
              ))}
            </div>
          </FeaturePanel>

          <FeaturePanel title="Export" shortcut="⌘ ⇧ E">
            <div className="mt-7 grid grid-cols-2 gap-2">
              {exportFormats.map((format) => (
                <div
                  key={format}
                  className="rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] px-3 py-4 text-center text-xs font-medium text-[var(--w-strong)]"
                >
                  {format}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-[var(--w-subtle)]">
              Keep headings, lists, emphasis, and line breaks.
            </p>
          </FeaturePanel>
        </section>

        <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-2 lg:py-24">
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs text-[var(--w-subtle)]">
                <span>Essay outline</span>
                <span>Saved</span>
              </div>
              <div className="mt-8 space-y-3">
                <div className="h-4 w-3/4 rounded bg-[var(--w-foreground)]/12" />
                <div className="h-3 w-full rounded bg-[var(--w-foreground)]/8" />
                <div className="h-3 w-5/6 rounded bg-[var(--w-foreground)]/8" />
                <div className="h-3 w-2/3 rounded bg-[var(--w-foreground)]/8" />
              </div>
            </div>
            <div className="absolute -right-3 -bottom-5 w-36 rounded-xl border border-[var(--w-border)] bg-[var(--w-surface-raised)] p-3 shadow-xl sm:-right-8">
              <p className="text-[10px] text-[var(--w-subtle)]">
                AI usage today
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--w-border)]">
                <div className="h-full w-1/3 rounded-full bg-[var(--w-foreground)]" />
              </div>
              <p className="mt-2 text-[9px] text-[var(--w-subtle)]">
                Resets tomorrow
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
              Private by intent
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Your draft stays a draft.
            </h2>
            <ul className="mt-7 space-y-4 text-sm leading-7 text-[var(--w-muted)]">
              <li>Only selected text is sent when you choose an AI action.</li>
              <li>
                Recent unsaved writing can stay protected in your browser.
              </li>
              <li>No social feed, audience, or collaboration layer.</li>
            </ul>
            <Link
              href="/privacy"
              className="mt-7 inline-flex text-sm font-medium text-[var(--w-strong)] underline decoration-[var(--w-subtle)] underline-offset-4"
            >
              Privacy in plain language
            </Link>
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

function EditorPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] shadow-2xl shadow-black/15">
      <div className="flex items-center justify-between border-b border-[var(--w-border-soft)] px-4 py-3 text-[11px] text-[var(--w-subtle)]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--w-foreground)]" />
          Focus Mode
        </span>
        <span className="landing-save-cycle">Saved</span>
      </div>
      <div className="px-6 py-9 sm:px-10 sm:py-12">
        <p className="text-2xl font-medium sm:text-3xl">The shape of an idea</p>
        <div className="mt-8 text-base leading-8 text-[var(--w-muted)] sm:text-lg">
          <p>
            Writing becomes clearer when the interface grows quiet around it.
          </p>
          <p className="mt-5">
            Start with the thought, then shape the language at your own pace.
          </p>
        </div>
        <div className="mt-9 flex flex-wrap gap-1.5 border-t border-[var(--w-border-soft)] pt-4">
          {formatButtons.map((button) => (
            <span
              key={button}
              className="rounded-md border border-[var(--w-border)] px-2.5 py-1.5 text-[10px] text-[var(--w-subtle)]"
            >
              {button}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WritingSample({
  label,
  text,
  improved = false,
}: {
  label: string;
  text: string;
  improved?: boolean;
}) {
  return (
    <div className="border-b border-[var(--w-border-soft)] p-6 lg:border-r lg:border-b-0">
      <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
        {label}
      </p>
      <p
        className={
          improved
            ? "mt-12 min-h-32 text-xl leading-9 text-[var(--w-foreground)]"
            : "mt-12 min-h-32 text-xl leading-9 text-[var(--w-muted)]"
        }
      >
        {text}
      </p>
      {improved && (
        <p className="mt-6 text-xs text-[var(--w-subtle)]">
          Repetition removed · meaning preserved
        </p>
      )}
    </div>
  );
}

function FeaturePanel({
  title,
  shortcut,
  children,
}: {
  title: string;
  shortcut: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">{title}</h3>
        <span className="rounded border border-[var(--w-border)] px-2 py-1 font-mono text-[10px] text-[var(--w-subtle)]">
          {shortcut}
        </span>
      </div>
      {children}
    </article>
  );
}
