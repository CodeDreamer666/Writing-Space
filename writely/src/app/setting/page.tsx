import type { Metadata } from "next";
import Link from "next/link";
import ThemeSelector from "~/components/shared/ThemeSelector";
import {
  DAILY_AI_TOKEN_LIMIT,
  MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import {
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
} from "~/lib/documentLimits";

export const metadata: Metadata = {
  title: "Settings & Help",
  description: "Writely preferences, shortcuts, limits, and help.",
};

const shortcuts = [
  ["Ctrl/Cmd + N", "Create a new document"],
  ["Ctrl/Cmd + S", "Save immediately"],
  ["Ctrl/Cmd + Shift + F", "Enter or exit Focus Mode"],
  ["Ctrl/Cmd + Shift + E", "Open document export"],
  ["Esc", "Close the active menu, dialog, export, or AI panel"],
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--w-background)] px-6 py-10 text-[var(--w-foreground)] sm:px-8 sm:py-14">
      <article className="mx-auto max-w-3xl pb-24">
        <Link
          href="/"
          className="text-sm text-[var(--w-muted)] transition-colors hover:text-[var(--w-foreground)]"
        >
          ← Back to Writely
        </Link>

        <header className="mt-12 border-b border-[var(--w-border-soft)] pb-10">
          <p className="text-xs font-medium tracking-[0.14em] text-[var(--w-subtle)] uppercase">
            Writely beta
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Settings &amp; Help
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-[var(--w-muted)]">
            Personalize your writing space and find the essentials quickly.
          </p>
        </header>

        <div className="divide-y divide-[var(--w-border-soft)]">
          <SettingsSection title="Theme">
            <p>Choose how Writely looks across every page and panel.</p>
            <div className="mt-5">
              <ThemeSelector />
            </div>
            <p className="mt-4 text-xs text-[var(--w-subtle)]">
              System follows your device setting and updates when it changes.
            </p>
          </SettingsSection>

          <SettingsSection title="Keyboard shortcuts">
            <p>Use the editor without leaving the keyboard.</p>
            <dl className="mt-6 divide-y divide-[var(--w-border-soft)] border-y border-[var(--w-border-soft)]">
              {shortcuts.map(([keys, description]) => (
                <div
                  key={keys}
                  className="flex items-center justify-between gap-6 py-3 text-sm"
                >
                  <dt className="text-[var(--w-strong)]">{description}</dt>
                  <dd className="shrink-0 rounded border border-[var(--w-border)] bg-[var(--w-surface)] px-2 py-1 font-mono text-xs text-[var(--w-muted)]">
                    {keys}
                  </dd>
                </div>
              ))}
            </dl>
          </SettingsSection>

          <SettingsSection title="Autosave">
            <p>
              Writely saves while you type and clearly shows Saving…, Saved, or
              Save failed so you know where your latest changes stand.
            </p>
            <p className="mt-4">
              If a save fails or a tab closes unexpectedly, a temporary browser
              recovery copy helps protect recent writing. Manual save remains
              available from the editor or with Ctrl/Cmd + S.
            </p>
          </SettingsSection>

          <SettingsSection title="AI usage">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                {DAILY_AI_TOKEN_LIMIT.toLocaleString()} AI tokens each day
              </li>
              <li>
                Up to {MAX_AI_SELECTION_CHARACTERS.toLocaleString()} selected
                characters per request
              </li>
              <li>One AI request at a time per user</li>
              <li>Only selected text is sent for an AI action</li>
            </ul>
            <p className="mt-4">
              The editor shows a simple daily usage bar. Failed or invalid AI
              responses do not reduce your Writely allowance.
            </p>
          </SettingsSection>

          <SettingsSection title="Document limits">
            <ul className="list-disc space-y-1 pl-5">
              <li>Up to {MAX_DOCUMENTS_PER_USER.toLocaleString()} documents</li>
              <li>
                Up to {MAX_DOCUMENT_CHARACTERS.toLocaleString()} characters per
                document
              </li>
            </ul>
          </SettingsSection>

          <SettingsSection title="Export">
            <p>
              Export the current document as TXT, Markdown, PDF, or Word. PDF,
              Word, and Markdown preserve supported structure and formatting.
            </p>
          </SettingsSection>

          <SettingsSection title="Privacy and beta">
            <p>
              Writely stores the account and document information needed to
              provide your writing workspace. AI runs only when you choose an
              action on selected text.
            </p>
            <Link
              href="/privacy"
              className="mt-5 inline-flex font-medium text-[var(--w-strong)] underline decoration-[var(--w-subtle)] underline-offset-4 hover:text-[var(--w-foreground)]"
            >
              Read the full Privacy page →
            </Link>
            <p className="mt-5">
              Writely is in beta. Features may change, so please use the
              feedback option when something feels unclear or does not work as
              expected.
            </p>
          </SettingsSection>
        </div>
      </article>
    </main>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <h2 className="text-xl font-medium text-[var(--w-foreground)]">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-7 text-[var(--w-muted)]">
        {children}
      </div>
    </section>
  );
}
