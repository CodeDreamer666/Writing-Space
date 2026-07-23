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
    ["Ctrl/Cmd + Alt + N", "Create document"],
    ["Ctrl/Cmd + S", "Save now"],
    ["Ctrl/Cmd + Alt + F", "Toggle Focus Mode"],
    ["Ctrl/Cmd + Alt + E", "Open export"],
    ["Esc", "Close active panels"],
];

export default function SettingsPage() {
    return (
        <main className="min-h-screen bg-[var(--w-background)] px-6 py-10 text-[var(--w-foreground)] sm:px-8 sm:py-14">
            <article className="mx-auto max-w-3xl pb-8">
                <header className="mt-4 border-b border-[var(--w-border-soft)] pb-10">
                    <div className="w-full flex justify-between items-center">
                        <p className="text-xs font-medium tracking-[0.14em] text-[var(--w-subtle)] uppercase">
                            Writely beta
                        </p>
                        <Link
                            href="/"
                            className="text-sm text-[var(--w-muted)] transition-colors hover:text-[var(--w-foreground)]"
                        >
                            ← Back to Writely
                        </Link>
                    </div>
                    <div>
                        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                            Settings &amp; Help
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-8 text-[var(--w-muted)]">
                            Personalize Writely and find important information.
                        </p>
                    </div>
                </header>

                <div className="divide-y divide-[var(--w-border-soft)]">
                    <SettingsSection title="Theme">
                        <p>Choose Light, Dark, or System.</p>
                        <div className="mt-5">
                            <ThemeSelector />
                        </div>
                        <p className="mt-4 text-xs text-[var(--w-subtle)]">
                            System follows your device setting.
                        </p>
                    </SettingsSection>

                    <SettingsSection title="Keyboard shortcuts">
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
                            Writely saves while you type and shows Saving…, Saved, or Save
                            failed.
                        </p>
                        <p className="mt-4">
                            A temporary browser recovery copy helps protect recent writing
                            when saving fails or the tab closes unexpectedly.
                        </p>
                    </SettingsSection>

                    <SettingsSection title="AI usage">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                {DAILY_AI_TOKEN_LIMIT.toLocaleString()} tokens each day
                            </li>
                            <li>
                                Up to {MAX_AI_SELECTION_CHARACTERS.toLocaleString()} selected
                                characters per request
                            </li>
                            <li>One request at a time</li>
                            <li>Only selected text is sent to AI</li>
                        </ul>
                        <p className="mt-4">
                            Failed or invalid responses do not reduce your Writely allowance.
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
                            Export documents as TXT, Markdown, PDF, or Word.
                        </p>
                    </SettingsSection>

                    <SettingsSection title="Privacy">
                        <p>
                            Writely stores the account and document information needed to
                            provide your writing workspace. AI runs only when you choose an
                            action on selected text.
                        </p>
                        <Link
                            href="/privacy"
                            className="mt-5 inline-flex font-medium text-[var(--w-strong)] underline decoration-[var(--w-subtle)] underline-offset-4 hover:text-[var(--w-foreground)]"
                        >
                            Read privacy in plain language →
                        </Link>
                    </SettingsSection>

                    <SettingsSection title="Beta">
                        <p className="mt-5">
                            Writely is currently in beta. Features may change, and feedback
                            is welcome when something feels unclear or does not work.
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
