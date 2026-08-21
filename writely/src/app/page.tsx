"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client";

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

const comparisonRows = [
    {
        typical: "Tools visible before writing",
        writely: "Tools appear after selecting text",
    },
    {
        typical: "AI can become the centre",
        writely: "AI stays hidden until requested",
    },
    {
        typical: "Document management inside the editor",
        writely: "The writing space stays almost empty",
    },
    {
        typical: "Designed around formatting the document",
        writely: "Designed around developing the thought",
    },
];

const trustItems = [
    { title: "Safe as you write", body: "Autosave and browser recovery" },
    { title: "Private by design", body: "AI receives selected text only" },
    { title: "Yours to take", body: "Export whenever you need" },
];

export default function LandingPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [demoChoice, setDemoChoice] = useState<"suggestion" | "original">(
        "suggestion",
    );

    const startWriting = async () => {
        if (!session) {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/app",
                errorCallbackURL: "/",
            });
            return;
        }

        router.push("/app");
    };

    return (
        <main
            data-writely-landing-page
            className="min-h-screen bg-(--w-background) text-(--w-foreground)"
        >
            <header className="flex items-center justify-between border-b border-(--w-border-soft) px-5 py-5 sm:px-10 sm:py-7">
                <div className="flex items-baseline gap-3.5">
                    <span className="font-mono-label text-[13px] tracking-[0.34em] uppercase">
                        Writely
                    </span>
                    <span className="font-mono-label text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase">
                        beta
                    </span>
                </div>
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => void startWriting()}
                    className="font-mono-label cursor-pointer border-0 border-b border-(--w-border) bg-transparent px-0 py-1 text-[11px] tracking-[0.18em] uppercase hover:border-(--w-foreground) disabled:cursor-wait disabled:opacity-60"
                >
                    Start writing
                </button>
            </header>

            <section className="grid border-b border-(--w-border-soft) lg:grid-cols-2">
                <div className="flex flex-col justify-center border-b border-(--w-border-soft) px-5 py-12 sm:px-10">
                    <p className="font-mono-label mb-10 text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase">
                        01 — The page
                    </p>
                    <h1 className="font-display text-[clamp(3rem,6.4vw,6.5rem)] leading-[0.98] font-light tracking-[-0.03em] text-balance">
                        A quieter place
                        <br />
                        <em>to write</em>
                    </h1>
                    <p className="mt-9 max-w-[42ch] text-[17px] leading-[1.7] text-(--w-muted)">
                        Writely keeps everything out of your way so you can think clearly.
                        AI only sees what you choose—never your whole document.
                    </p>
                    <div className="mt-11 flex flex-wrap items-center gap-5">
                        <PrimaryButton
                            disabled={isPending}
                            onClick={() => void startWriting()}
                        >
                            Start writing
                        </PrimaryButton>
                        <span className="font-mono-label text-[11px] tracking-[0.14em] text-(--w-subtle) uppercase">
                            Free during beta · Autosaved
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center bg-(--w-surface) px-5 py-12 sm:px-10 sm:py-14">
                    <div className="w-full max-w-[520px] border border-(--w-border) bg-(--w-background)">
                        <div className="flex items-center justify-between border-b border-(--w-border-soft) px-[18px] py-3.5">
                            <span className="flex w-4 flex-col gap-[3px]" aria-hidden="true">
                                <i className="h-px bg-(--w-foreground)" />
                                <i className="h-px bg-(--w-foreground)" />
                                <i className="h-px bg-(--w-foreground)" />
                            </span>
                            <span className="font-mono-label text-[10px] tracking-[0.18em] text-(--w-subtle) uppercase">
                                Saved
                            </span>
                        </div>
                        <div className="px-5 py-9 sm:px-7 sm:pt-[46px] sm:pb-[34px]">
                            <ToolbarPreview />
                            <p className="font-display text-[clamp(1.3rem,2.4vw,1.85rem)] leading-[1.45] font-light">
                                The first clear sentence gives{" "}
                                <span className="bg-(--w-foreground) px-0.5 text-(--w-background)">
                                    the rest of the thought
                                </span>{" "}
                                somewhere to go.
                            </p>
                        </div>
                        <p className="font-mono-label border-t border-(--w-border-soft) px-[18px] py-4 text-center text-[10px] tracking-[0.14em] uppercase">
                            AI only receives the selected passage
                        </p>
                    </div>
                </div>
            </section>

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

            <section className="border-b border-(--w-border-soft) px-5 py-16 sm:px-10 sm:py-[88px]">
                <p className="font-mono-label mb-10 text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase">
                    03 — The difference
                </p>
                <h2 className="font-display mb-14 max-w-[24ch] text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.04] font-light tracking-[-0.03em]">
                    Built around the <em>thought</em>, not the toolbar
                </h2>
                <div className="border-t border-(--w-foreground)">
                    <div className="grid grid-cols-2 border-b border-(--w-border-soft)">
                        <p className="font-mono-label py-4 pr-4 text-[10px] tracking-[0.18em] text-(--w-subtle) uppercase sm:pr-6">
                            Typical document editor
                        </p>
                        <p className="font-mono-label border-l border-(--w-border-soft) py-4 pl-4 text-[10px] tracking-[0.18em] uppercase sm:pl-6">
                            Writely
                        </p>
                    </div>
                    {comparisonRows.map((row) => (
                        <div
                            key={row.typical}
                            className="grid grid-cols-2 border-b border-(--w-border-soft)"
                        >
                            <p className="py-5 pr-4 text-sm leading-[1.6] text-(--w-subtle) sm:py-[26px] sm:pr-6 sm:text-base">
                                {row.typical}
                            </p>
                            <p className="border-l border-(--w-border-soft) py-5 pl-4 text-sm leading-[1.6] sm:py-[26px] sm:pl-6 sm:text-base">
                                {row.writely}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-14 grid gap-9 lg:grid-cols-3 lg:gap-8">
                    {trustItems.map((item) => (
                        <div key={item.title}>
                            <h3 className="font-display mb-2.5 text-[22px] leading-[1.2] font-normal">
                                {item.title}
                            </h3>
                            <p className="text-sm leading-[1.7] text-(--w-muted)">
                                {item.body}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-5 py-24 text-center sm:px-10 sm:py-[140px]">
                <h2 className="font-display mx-auto max-w-[18ch] text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.02] font-light tracking-[-0.03em]">
                    Your next sentence deserves some <em>space</em>
                </h2>
                <div className="mt-12">
                    <PrimaryButton
                        disabled={isPending}
                        onClick={() => void startWriting()}
                    >
                        Start writing
                    </PrimaryButton>
                </div>
                <p className="font-mono-label mt-[26px] text-[11px] tracking-[0.14em] uppercase">
                    Free during beta · Autosaved automatically
                </p>
            </section>
        </main>
    );
}

function PrimaryButton({
    children,
    disabled,
    onClick,
}: {
    children: React.ReactNode;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="h-14 cursor-pointer border-0 bg-(--w-foreground) px-[34px] text-[15px] font-medium text-(--w-background) hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
        >
            {children}
        </button>
    );
}

function ChoiceButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`h-[46px] cursor-pointer border-0 px-4 text-sm sm:px-6 ${active ? "bg-(--w-foreground) font-medium text-(--w-background)" : "bg-transparent text-(--w-subtle)"}`}
        >
            {children}
        </button>
    );
}

function ToolbarPreview() {
    return (
        <div
            aria-hidden="true"
            className="mb-[30px] inline-flex h-[46px] max-w-full items-center gap-4 border border-(--w-border) bg-(--w-surface-raised) px-3 sm:gap-[22px] sm:px-4"
        >
            <b className="text-[13px]">B</b>
            <i className="font-display text-[13px]">I</i>
            <b className="text-[13px]">H</b>
            <span className="text-sm">≡</span>
            <span className="font-display text-[19px]">“</span>
            <span className="font-mono-label bg-(--w-foreground) px-2 py-1 text-[10px] tracking-[0.14em] text-(--w-background)">
                AI
            </span>
        </div>
    );
}
