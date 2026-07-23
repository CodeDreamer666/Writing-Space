import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
    AiRewriteDemo,
    AutosaveDemo,
    EditorPreview,
    ExportDemo,
    FocusModeDemo,
} from "./LandingDemos";
import LandingNavAction from "./LandingNavAction";

export const metadata: Metadata = {
    title: "Make room for the thought",
    description:
        "Writely is a calm, private writing space with autosave, recovery, focused editing, and optional AI help for selected text.",
};

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
        description: "It only sees the passage you select, when you ask for help.",
    },
] as const;

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <p className="flex items-center gap-3 text-[11px] font-medium tracking-[0.18em] text-[var(--landing-accent)] uppercase">
            <span className="h-px w-8 bg-[var(--landing-accent)]" />
            {children}
        </p>
    );
}

export default function LandingPage() {
    return (
        <main className="landing-page min-h-screen overflow-hidden bg-[var(--w-background)] text-[var(--w-foreground)]">
            <div className="mx-auto max-w-7xl px-8 lg:px-12">
                <header className="flex min-h-20 items-center justify-between border-b border-[var(--w-border-soft)]">
                    <Link
                        href="/landing"
                        className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-[var(--w-strong)] uppercase"
                        aria-label="Writely home"
                    >
                        <span className="flex size-9 items-center justify-center rounded-lg border border-[var(--w-border)] bg-[var(--w-surface)] text-base tracking-normal normal-case shadow-sm">
                            W
                        </span>
                        Writely
                    </Link>

                    <LandingNavAction />
                </header>

                <section className="relative grid items-center lg:grid-cols-[0.88fr_1.12fr] py-16 gap-8">
                    <div className="relative z-10 max-w-xl">
                        <p className="flex items-center gap-3 text-[11px] font-medium tracking-[0.18em] text-[var(--landing-accent)] uppercase">
                            <span className="size-1.5 rounded-full bg-[var(--landing-accent)]" />
                            Your private writing space
                        </p>
                        <h1 className="mt-6 max-w-2xl text-6xl leading-[0.98] font-medium tracking-[-0.055em] text-balance lg:text-7xl xl:text-[5.25rem]">
                            Give ideas{" "}
                            <span className="font-serif font-normal text-[var(--landing-accent)] italic">
                                room
                            </span>
                        </h1>
                        <p className="mt-7 max-w-lg text-lg leading-8 text-[var(--w-muted)]">
                            Writely keeps the page calm, saves every change, and brings in AI
                            only for the words you choose.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Link
                                href="/"
                                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-6 text-sm font-medium text-[var(--w-background)] shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:opacity-90"
                            >
                                Start a private draft
                                <span aria-hidden="true" className="ml-2">
                                    →
                                </span>
                            </Link>
                        </div>
                    </div>

                    <EditorPreview />
                </section>

                <section className="grid border-y border-[var(--w-border-soft)] lg:grid-cols-3">
                    {principles.map((principle, index) => (
                        <article
                            key={principle.number}
                            className={`py-7 lg:px-8 ${index > 0 ? "border-t border-[var(--w-border-soft)] lg:border-t-0 lg:border-l" : "lg:pl-0"}`}
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

                <section id="how-it-works" className="scroll-mt-8 py-24">
                    <div>
                        <SectionLabel>Selected-text AI</SectionLabel>
                        <h2 className="mt-5 text-4xl leading-tight font-medium tracking-[-0.04em] text-balance lg:text-5xl">
                            Ask for a better sentence.
                            Keep the final say.
                        </h2>

                        <div className="max-w-xl lg:pt-4">
                            <p className="text-lg leading-8 text-[var(--w-muted)]">
                                Select the exact passage that needs help, compare the rewrite
                                with your original, and replace it only when it still sounds like
                                you.
                            </p>
                            <p className="mt-4 text-sm leading-7 text-[var(--w-subtle)]">
                                Only the selected text is sent to AI.
                            </p>
                        </div>
                    </div>

                    <AiRewriteDemo />
                </section>

                <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[0.78fr_1.22fr]">
                    <div className="max-w-md">
                        <SectionLabel>Focus Mode</SectionLabel>
                        <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] text-balance lg:text-5xl">
                            Give the sentence the whole room.
                        </h2>
                        <p className="mt-5 text-base leading-8 text-[var(--w-muted)]">
                            Fade the surrounding interface when you want one clear page and
                            fewer reasons to look away.
                        </p>
                    </div>

                    <FocusModeDemo expanded />
                </section>

                <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[1.22fr_0.78fr]">
                    <div className="max-w-md lg:order-2 lg:justify-self-end">
                        <SectionLabel>Autosave &amp; recovery</SectionLabel>
                        <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] text-balance lg:text-5xl">
                            Keep writing. Saving stays quiet.
                        </h2>
                        <p className="mt-5 text-base leading-8 text-[var(--w-muted)]">
                            Every change is saved, with a recent local recovery copy ready
                            when the connection is not.
                        </p>
                    </div>

                    <div className="lg:order-1">
                        <AutosaveDemo expanded />
                    </div>
                </section>

                <section className="grid items-center gap-12 border-t border-[var(--w-border-soft)] py-16 lg:grid-cols-[0.78fr_1.22fr]">
                    <div className="max-w-md">
                        <SectionLabel>Export</SectionLabel>
                        <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] text-balance lg:text-5xl">
                            Take the finished draft with you.
                        </h2>
                        <p className="mt-5 text-base leading-8 text-[var(--w-muted)]">
                            Move from writing to sharing with TXT, Markdown, PDF, and Word
                            exports.
                        </p>
                    </div>

                    <ExportDemo expanded />
                </section>

                <section className="py-24 border-[var(--w-border-soft)] border-t w-full">
                    <div className="relative overflow-hidden rounded-3xl border border-[var(--landing-accent)]/35 bg-[var(--landing-accent-soft)] px-10 py-14 lg:flex lg:items-end lg:justify-between lg:px-14 lg:py-16">
                        <div className="max-w-2xl">
                            <p className="font-serif text-lg text-[var(--landing-accent)] italic">
                                One clear page. One thought at a time.
                            </p>
                            <h2 className="mt-4 text-4xl leading-tight font-medium tracking-[-0.045em] text-balance lg:text-5xl">
                                Your next sentence deserves a quieter place.
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--w-muted)]">
                                Open a private draft, let Writely handle the saving, and stay
                                with the work in front of you.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="mt-9 inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-6 text-sm font-medium text-[var(--w-background)] transition-transform hover:-translate-y-0.5 hover:opacity-90 lg:mt-0"
                        >
                            Start writing
                            <span aria-hidden="true" className="ml-2">
                                →
                            </span>
                        </Link>
                    </div>
                </section>

                <footer className="flex items-center justify-between border-t border-[var(--w-border-soft)] py-8 text-sm text-[var(--w-subtle)]">
                    <span>Writely · Desktop beta</span>
                    <div className="flex items-center gap-5">
                        <Link href="/privacy" className="hover:text-[var(--w-foreground)]">
                            Privacy
                        </Link>
                        <Link href="/setting" className="hover:text-[var(--w-foreground)]">
                            Settings &amp; Help
                        </Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}
