"use client";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LegalLinks } from "~/components/layout/LegalLinks";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { queuePendingDraft } from "~/features/docs/utils/pendingDraft";
import {
    containsUnsupportedPictographs,
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
} from "~/lib/writingLanguage";
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
] as const;

const trustItems = [
    {
        icon: "shield-check",
        title: "Safe as you write",
        children: "Autosave and browser recovery",
    },
    {
        icon: "lock",
        title: "Private by design",
        children: " AI receives selected text only",
    },
    {
        icon: "download",
        title: "Yours to take",
        children: "Export whenever you need",
    },
];

type DemoChoice = "suggestion" | "original";

type LandingIconName =
    | "ai"
    | "align"
    | "arrow"
    | "bolt"
    | "cloud"
    | "document"
    | "download"
    | "folder"
    | "format"
    | "lock"
    | "menu"
    | "shield"
    | "shield-check"
    | "sparkle"
    | "toolbar";

export default function LandingPageContent() {
    const router = useRouter();
    const { showMessage } = useStatusMessage();
    const { data: session, isPending: isSessionPending } =
        authClient.useSession();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [demoChoice, setDemoChoice] = useState<DemoChoice>("suggestion");

    const signInWithGoogle = async () => {
        if (isSessionPending || isSigningIn) {
            return;
        }

        setIsSigningIn(true);

        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/app",
                errorCallbackURL: "/",
            });

            if (result.error) {
                showMessage(
                    "We couldn't start Google sign-in. Please try again.",
                    false,
                );
                setIsSigningIn(false);
            }
        } catch {
            showMessage("We couldn't start Google sign-in. Please try again.", false);
            setIsSigningIn(false);
        }
    };

    const continueWithPassage = async (text: string) => {
        if (containsUnsupportedPictographs(text)) {
            showMessage(UNSUPPORTED_PICTOGRAPH_MESSAGE, false);
            return;
        }

        if (!queuePendingDraft(text)) {
            showMessage(
                "Your browser blocked temporary storage. Copy your sentence before continuing.",
                false,
            );
            return;
        }

        if (session?.user) {
            router.push("/app");
            return;
        }

        await signInWithGoogle();
    };

    return (
        <main
            data-writely-landing-page
            className={[
                "pt-12",
                "landing-page min-w-0 overflow-x-clip",
                "[font-family:var(--font-inter),ui-sans-serif,system-ui,sans-serif]",
                "text-(--landing-text) scheme-dark",
                "[--landing-accent-bright:#e3aa6a] [--landing-accent-ink:#16110c]",
                "[--landing-accent:#cf965c] [--landing-background:#050606]",
                "[--landing-border-soft:#262522] [--landing-border:#393631]",
                "[--landing-muted:#9a9996] [--landing-panel-soft:rgb(18_17_15/86%)]",
                "[--landing-panel:rgb(21_20_18/94%)] [--landing-subtle:#76736f]",
                "[--landing-text:#f2f0ed] [background:var(--landing-background)]",
                "**:box-border [&_*::after]:box-border [&_*::before]:box-border",
                "[&_:where(button,a)]:[-webkit-tap-highlight-color:transparent]",
                "[&_:where(button,a,textarea)]:font-[inherit]",
                "[&_a:focus-visible]:[outline:2px_solid_var(--landing-accent-bright)]",
                "[&_a:focus-visible]:outline-offset-4",
                "[&_button:focus-visible]:[outline:2px_solid_var(--landing-accent-bright)]",
                "[&_button:focus-visible]:outline-offset-4",
                "[&_textarea:focus-visible]:[outline:2px_solid_var(--landing-accent-bright)]",
                "[&_textarea:focus-visible]:outline-offset-4",
            ].join(" ")}
        >
            <section
                aria-labelledby="landing-hero-title"
                className={[
                    "relative py-12 [background:radial-gradient(ellipse_70%_24%_at_52%_91%,rgb(150_103_61/20%),transparent_72%),radial-gradient(circle_at_43%_38%,#151411_0,#090a09_38%,#040505_82%)] [&::after]:pointer-events-none",
                    "[&::after]:absolute [&::after]:inset-0 [&::after]:z-2 [&::after]:[content:'']",
                    "[&::after]:[background:linear-gradient(90deg,rgb(0_0_0/30%),transparent_22%,transparent_76%,rgb(0_0_0/28%)),linear-gradient(180deg,rgb(0_0_0/22%),transparent_34%,transparent_78%,rgb(0_0_0/20%))] [&::before]:pointer-events-none [&::before]:absolute [&::before]:inset-0",
                    "[&::before]:z-1 [&::before]:bg-[radial-gradient(circle_at_17%_31%,rgb(255_255_255/28%)_0_0.55px,transparent_0.7px),radial-gradient(circle_at_73%_64%,rgb(255_255_255/22%)_0_0.45px,transparent_0.65px)] [&::before]:bg-size-[4px_4px,5px_5px] [&::before]:bg-position-[0_0,7px_11px]",
                    "[&::before]:opacity-[0.09] [&::before]:mix-blend-soft-light [&::before]:[content:'']",
                ].join(" ")}
            >
                <div className="relative z-4 mx-auto w-full max-w-[1480px] px-10">
                    <div className="grid min-w-0 items-center gap-16 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:gap-20">
                        <div className="relative z-5 max-w-[560px] min-w-0 xl:py-8 [&_.landing-actionButton]:mt-10">
                            <h2
                                className={[
                                    "max-w-[560px] [font-family:var(--font-source-serif),Georgia,serif] text-[clamp(3rem,5.1vw,4.5rem)] leading-[1.08]",
                                    "font-normal tracking-[-0.04em] [&_em]:text-(--landing-accent) [&_em]:not-italic",
                                    "[&_span]:block",
                                ].join(" ")}
                            >
                                A <em>Quieter</em> place to <em>Write</em>
                            </h2>
                            <p className="landing-heroDescription mt-8 max-w-[520px] text-base leading-8 tracking-[-0.01em] text-[#aaa8a4] sm:text-[18px] sm:leading-9">
                                Writely keeps everything out of your way so you can think
                                clearly. AI only sees what you choose—never your whole document.
                            </p>
                            <ActionButton
                                onClick={() => {
                                    void continueWithPassage("");
                                }}
                                disabled={isSessionPending || isSigningIn}
                            >
                                Start writing
                            </ActionButton>
                            <div
                                className={[
                                    "landing-heroAssurances mt-8 flex flex-wrap",
                                    "items-center gap-x-4 gap-y-3 text-[14px]",
                                    "text-[#aaa7a1] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-2",
                                    "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:stroke-[1.45] [&_svg]:text-(--landing-accent)",
                                ].join(" ")}
                            >
                                <span>
                                    Free during beta
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="landing-assuranceDivider text-[#5c5853]"
                                >
                                    ·
                                </span>
                                <span>
                                    Autosaved automatically
                                </span>
                            </div>
                        </div>

                        <div
                            aria-label="A Writely editor showing tools for selected text"
                            className={[
                                "relative h-[520px] w-full max-w-[768px]",
                                "justify-self-end overflow-hidden rounded-2xl border",
                                "border-[#44413c] [box-shadow:inset_0_1px_rgb(255_255_255/2%),0_36px_90px_rgb(0_0_0/26%)] [background:radial-gradient(circle_at_58%_44%,rgb(41_38_34/34%),transparent_49%),linear-gradient(110deg,rgb(16_16_15/94%),rgb(25_24_22/93%))]",
                            ].join(" ")}
                        >
                            <div className="landing-editorPanelHeader absolute top-8 right-7 left-7 flex items-center justify-between text-[14px] text-[#9d9994] sm:top-10 sm:right-10 sm:left-10 sm:text-base">
                                <span
                                    aria-hidden="true"
                                    className="landing-menuIcon inline-flex h-[28px] w-[28px] items-center justify-center [&_svg]:h-[25px] [&_svg]:w-[25px] [&_svg]:stroke-[1.2]"
                                >
                                    <LandingIcon name="menu" />
                                </span>
                                <span
                                    className={[
                                        "landing-savedStatus inline-flex items-center gap-[13px]",
                                        "[&_>_span]:h-[8px] [&_>_span]:w-[8px] [&_>_span]:rounded-[999px] [&_>_span]:[box-shadow:0_0_12px_rgb(0_185_128/24%)]",
                                        "[&_>_span]:[background:#00b980]",
                                    ].join(" ")}
                                >
                                    <span aria-hidden="true" />
                                    Saved
                                </span>
                            </div>
                            <SelectionToolbar className="landing-heroToolbar absolute top-[30%] left-[7%] w-[min(371px,86%)] max-w-[calc(100%-40px)] gap-5 sm:gap-[30px]" />
                            <p
                                className={[
                                    "landing-heroEditorSentence absolute top-[45%] left-[7%]",
                                    "m-0 w-[86%] max-w-[720px] [font-family:var(--font-source-serif),Georgia,serif]",
                                    "text-[clamp(1.45rem,3.2vw,2.1rem)] leading-normal font-normal tracking-tight",
                                    "text-[#f0ede9]",
                                ].join(" ")}
                            >
                                The first clear sentence gives{" "}
                                <span
                                    className={[
                                        "landing-selectedText landing-selectionStart relative z-1",
                                        "[box-decoration-break:clone] text-[#d9a264]",
                                        "[box-shadow:0_0_18px_rgb(196_130_64/8%)] [-webkit-box-decoration-break:clone]",
                                        "[background:rgb(143_95_48/35%)]",
                                        "[&::after]:absolute [&::after]:top-[-0.2em] [&::after]:left-[-5px] [&::after]:z-3",
                                        "[&::after]:h-[11px] [&::after]:w-[11px] [&::after]:rounded-[999px]",
                                        "[&::after]:[box-shadow:0_1px_4px_rgb(0_0_0/40%)] [&::after]:[content:'']",
                                        "[&::after]:[background:#dda362]",
                                        "[&::before]:absolute [&::before]:top-[-0.08em] [&::before]:-left-px [&::before]:z-2",
                                        "[&::before]:h-[1.08em] [&::before]:w-[2px] [&::before]:[content:'']",
                                        "[&::before]:[background:#d99d5e]",
                                    ].join(" ")}
                                >
                                    the rest of the{" "}
                                </span>
                                <span
                                    className={[
                                        "landing-selectedText landing-selectionEnd relative z-1",
                                        "[box-decoration-break:clone] text-[#d9a264]",
                                        "[box-shadow:0_0_18px_rgb(196_130_64/8%)] [-webkit-box-decoration-break:clone]",
                                        "[background:rgb(143_95_48/35%)]",
                                        "[&::after]:absolute [&::after]:-right-px [&::after]:bottom-[-0.08em] [&::after]:z-2",
                                        "[&::after]:h-[1.08em] [&::after]:w-[2px] [&::after]:[content:'']",
                                        "[&::after]:[background:#d99d5e]",
                                        "[&::before]:absolute [&::before]:right-[-5px] [&::before]:bottom-[-0.2em] [&::before]:z-3",
                                        "[&::before]:h-[11px] [&::before]:w-[11px] [&::before]:rounded-[999px]",
                                        "[&::before]:[box-shadow:0_1px_4px_rgb(0_0_0/40%)] [&::before]:[content:'']",
                                        "[&::before]:[background:#dda362]",
                                    ].join(" ")}
                                >
                                    thought
                                </span>{" "}
                                somewhere to go.
                            </p>
                            <p
                                className={[
                                    "landing-panelPrivacy absolute right-5 bottom-8",
                                    "left-5 m-0 flex items-center",
                                    "justify-center gap-3 text-center text-[13px]",
                                    "leading-6 text-[#8f8b86] sm:bottom-10 sm:text-[14px]",
                                    "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.35]",
                                    "[&_svg]:text-[#a77b4d]",
                                ].join(" ")}
                            >
                                <LandingIcon name="lock" />
                                AI only receives the selected passage.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="how-it-works-title"
                className={[
                    "relative",
                    "[background:radial-gradient(ellipse_70%_24%_at_50%_91%,rgb(150_103_61/20%),transparent_74%),radial-gradient(circle_at_52%_42%,#131311_0,#080908_46%,#040505_82%)]",
                    "sm:py-24 lg:py-32 xl:py-36",
                    "[&::after]:pointer-events-none [&::after]:absolute [&::after]:inset-0 [&::after]:z-2",
                    "[&::after]:[content:''] [&::after]:[background:linear-gradient(90deg,rgb(0_0_0/30%),transparent_22%,transparent_76%,rgb(0_0_0/28%)),linear-gradient(180deg,rgb(0_0_0/22%),transparent_34%,transparent_78%,rgb(0_0_0/20%))]",
                    "[&::before]:pointer-events-none [&::before]:absolute [&::before]:inset-0 [&::before]:z-1",
                    "[&::before]:bg-[radial-gradient(circle_at_17%_31%,rgb(255_255_255/28%)_0_0.55px,transparent_0.7px),radial-gradient(circle_at_73%_64%,rgb(255_255_255/22%)_0_0.45px,transparent_0.65px)]",
                    "[&::before]:bg-size-[4px_4px,5px_5px] [&::before]:bg-position-[0_0,7px_11px]",
                    "[&::before]:opacity-[0.09] [&::before]:mix-blend-soft-light [&::before]:[content:'']",
                ].join(" ")}
            >
                <div className="relative z-4 mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 xl:px-16">
                    <div className="max-w-[760px]">
                        <p className="text-[15px] font-semibold tracking-[0.18em] text-(--landing-accent-bright) uppercase">
                            How it works
                        </p>
                        <h2
                            className={[
                                "mt-5 max-w-[760px] [font-family:var(--font-source-serif),Georgia,serif] text-[clamp(2.8rem,4.5vw,4rem)]",
                                "leading-[1.08] font-normal tracking-[-0.04em] [&_em]:text-(--landing-accent)",
                                "[&_em]:not-italic",
                            ].join(" ")}
                        >
                            The interface waits for <em>you</em>
                        </h2>
                        <p className="mt-6 text-base leading-8 text-[#aaa8a4] sm:text-[18px] sm:leading-9">
                            Writely stays out of your way—until you need it
                            <br />
                            Then it helps you say it, clearly
                        </p>
                    </div>

                    <div className="mt-16 grid min-w-0 grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)] xl:gap-3">
                        <article
                            className={`relative grid min-h-[360px] grid-rows-[1fr_auto_1fr] rounded-2xl border border-[#3a3733] bg-[radial-gradient(circle_at_60%_44%,rgb(50_45_39/22%),transparent_52%),linear-gradient(110deg,rgb(15_16_15/93%),rgb(22_21_19/91%))] p-8 shadow-[inset_0_1px_rgb(255_255_255/2%)]`}
                        >
                            <div className="row-start-2 flex w-full items-center justify-center">
                                <p className="max-w-[380px] [font-family:var(--font-source-serif),Georgia,serif] text-[clamp(1.25rem,2vw,1.55rem)] leading-[1.45] tracking-[-0.02em] text-[#ece9e5]">
                                    A small idea becomes clearer when the page leaves it alone
                                </p>
                            </div>

                            <div className="row-start-3 flex w-full items-end">
                                <p className="flex items-center gap-3 text-[14px] text-[#918d87] [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.4] [&_svg]:text-[#b07d47]">
                                    Your words, your pace
                                </p>
                            </div>
                        </article>

                        <span
                            aria-hidden="true"
                            className="hidden items-center justify-center text-[30px] font-extralight text-(--landing-accent-bright) xl:flex"
                        >
                            →
                        </span>

                        <article
                            className={`relative grid min-h-[360px] grid-rows-[1fr_auto_1fr] rounded-2xl border border-[#3a3733] bg-[radial-gradient(circle_at_60%_44%,rgb(50_45_39/22%),transparent_52%),linear-gradient(110deg,rgb(15_16_15/93%),rgb(22_21_19/91%))] p-8 shadow-[inset_0_1px_rgb(255_255_255/2%)]`}
                        >
                            <SelectionToolbar className="absolute top-6 left-1/2 z-4 h-[60px] w-[min(309px,calc(100%-32px))] -translate-x-1/2 gap-5 px-4 sm:gap-6 [&_.landing-aiTool]:h-9" />

                            <div className="row-start-2 flex w-full items-center justify-center">
                                <p
                                    className={[
                                        "[font-family:var(--font-source-serif),Georgia,serif] text-[clamp(1.25rem,2vw,1.55rem)] leading-normal font-normal",
                                        "tracking-[-0.02em] text-[#ece9e5] [&_em]:text-(--landing-accent) [&_em]:not-italic",
                                    ].join(" ")}
                                >
                                    A small idea{" "}
                                    <span
                                        className={[
                                            "relative z-1 [box-decoration-break:clone] text-[#d9a264]",
                                            "[box-shadow:0_0_18px_rgb(196_130_64/8%)] [-webkit-box-decoration-break:clone] [background:rgb(143_95_48/35%)] [&::after]:absolute",
                                            "[&::after]:top-[-0.2em] [&::after]:left-[-5px] [&::after]:z-3 [&::after]:h-[11px]",
                                            "[&::after]:w-[11px] [&::after]:rounded-[999px] [&::after]:[box-shadow:0_1px_4px_rgb(0_0_0/40%)] [&::after]:[content:'']",
                                            "[&::after]:[background:#dda362] [&::before]:absolute [&::before]:top-[-0.08em] [&::before]:-left-px",
                                            "[&::before]:z-2 [&::before]:h-[1.08em] [&::before]:w-[2px] [&::before]:[content:'']",
                                            "[&::before]:[background:#d99d5e]",
                                        ].join(" ")}
                                    >
                                        becomes clearer when the page leaves it alone
                                    </span>
                                    <span
                                        className={[
                                            "relative z-1 [box-decoration-break:clone] text-[#d9a264]",
                                            "[box-shadow:0_0_18px_rgb(196_130_64/8%)] [-webkit-box-decoration-break:clone] [background:rgb(143_95_48/35%)] [&::after]:absolute",
                                            "[&::after]:-right-px [&::after]:bottom-[-0.08em] [&::after]:z-2 [&::after]:h-[1.08em]",
                                            "[&::after]:w-[2px] [&::after]:[content:''] [&::after]:[background:#d99d5e] [&::before]:absolute",
                                            "[&::before]:right-[-5px] [&::before]:bottom-[-0.2em] [&::before]:z-3 [&::before]:h-[11px]",
                                            "[&::before]:w-[11px] [&::before]:rounded-[999px] [&::before]:[box-shadow:0_1px_4px_rgb(0_0_0/40%)] [&::before]:[content:'']",
                                            "[&::before]:[background:#dda362]",
                                        ].join(" ")}
                                    />
                                </p>
                            </div>

                            <div className="row-start-3 flex w-full items-end">
                                <p className="flex items-center gap-3 text-[14px] text-[#918d87] [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.4] [&_svg]:text-[#b07d47]">
                                    Text selected
                                </p>
                            </div>
                        </article>

                        <span
                            aria-hidden="true"
                            className="hidden items-center justify-center text-[30px] font-extralight text-(--landing-accent-bright) xl:flex"
                        >
                            →
                        </span>

                        <article
                            className={`grid min-h-[360px] grid-rows-[auto_1fr_auto] gap-0 rounded-2xl border border-[#3a3733] bg-[radial-gradient(circle_at_60%_44%,rgb(50_45_39/22%),transparent_52%),linear-gradient(110deg,rgb(15_16_15/93%),rgb(22_21_19/91%))] p-8 shadow-[inset_0_1px_rgb(255_255_255/2%)]`}
                        >
                            <p className="m-0 flex items-center gap-2 text-[13px] text-(--landing-accent) [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-[1.4]">
                                Writely suggests
                            </p>
                            <div className="flex items-center">
                                {demoChoice === "suggestion" ? (
                                    <p
                                        className={[
                                            "m-0 [font-family:var(--font-source-serif),Georgia,serif] text-[clamp(1.25rem,2vw,1.55rem)] leading-normal",
                                            "font-normal tracking-[-0.02em] text-[#ece9e5] [&_em]:text-(--landing-accent)",
                                            "[&_em]:not-italic",
                                        ].join(" ")}
                                    >
                                        A small idea becomes clearer when the page{" "}
                                        <em>steps aside and lets it breathe</em>
                                    </p>
                                ) : (
                                    <p
                                        className={[
                                            "m-0 [font-family:var(--font-source-serif),Georgia,serif] text-[clamp(1.25rem,2vw,1.55rem)] leading-normal",
                                            "font-normal tracking-[-0.02em] text-[#ece9e5] [&_em]:text-(--landing-accent)",
                                            "[&_em]:not-italic",
                                        ].join(" ")}
                                    >
                                        A small idea becomes clearer when the page leaves it alone
                                    </p>
                                )}
                            </div>
                            <div>
                                <div
                                    role="group"
                                    aria-label="Choose the final text"
                                    className="relative grid h-12 w-full max-w-[336px] grid-cols-2 overflow-hidden rounded-[10px] border border-[#3f3b36] bg-[#211f1c]"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-[9px] bg-[linear-gradient(110deg,#ca843a,#e0a45c)] transition-transform duration-250 ease-out ${demoChoice === "original"
                                            ? "translate-x-full"
                                            : "translate-x-0"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setDemoChoice("suggestion")}
                                        aria-pressed={demoChoice === "suggestion"}
                                        className={[
                                            "relative z-1 cursor-pointer rounded-[9px]",
                                            "border-0 bg-transparent px-3 text-[14px]",
                                            "text-[#7d7975] transition-[background-color,color] duration-250 focus-visible:outline-2",
                                            "focus-visible:outline-offset-[-3px] focus-visible:outline-[#f4b769] aria-pressed:text-[#1b140d]",
                                        ].join(" ")}
                                    >
                                        Use suggestion
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDemoChoice("original")}
                                        aria-pressed={demoChoice === "original"}
                                        className={[
                                            "relative z-1 cursor-pointer rounded-[9px]",
                                            "border-0 bg-transparent px-3 text-[14px]",
                                            "text-[#7d7975] transition-[background-color,color] duration-250 focus-visible:outline-2",
                                            "focus-visible:outline-offset-[-3px] focus-visible:outline-[#f4b769] aria-pressed:text-[#1b140d]",
                                        ].join(" ")}
                                    >
                                        Keep mine
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>

                    <ol
                        className={[
                            "mt-16 grid grid-cols-1 gap-10",
                            "p-0 [list-style:none] lg:grid-cols-3 lg:gap-12",
                            "[&_li]:min-w-0 [&_li_>_p]:mt-5 [&_li_>_p]:max-w-[360px] [&_li_>_p]:pl-11",
                            "[&_li_>_p]:text-base [&_li_>_p]:leading-8 [&_li_>_p]:text-[#99958f]",
                        ].join(" ")}
                    >
                        {steps.map((step) => {
                            return (
                                <li key={step.number}>
                                    <div
                                        className={[
                                            "landing-stepHeading flex items-baseline gap-5",
                                            "[&_>_span]:[font-family:var(--font-source-serif),Georgia,serif] [&_>_span]:text-base [&_>_span]:text-(--landing-accent) [&_>_span]:italic",
                                            "[&_h3]:m-0 [&_h3]:[font-family:var(--font-source-serif),Georgia,serif] [&_h3]:text-[28px] [&_h3]:leading-none",
                                            "[&_h3]:font-normal",
                                        ].join(" ")}
                                    >
                                        <span>{step.number}</span>
                                        <h3>{step.title}</h3>
                                    </div>
                                    <p>{step.description}</p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            <section
                aria-labelledby="comparison-title"
                className={[
                    "relative [background:radial-gradient(ellipse_70%_24%_at_52%_91%,rgb(150_103_61/20%),transparent_72%),radial-gradient(circle_at_43%_38%,#151411_0,#090a09_38%,#040505_82%)] before:pointer-events-none before:absolute",
                    "before:inset-0 before:z-[1] before:bg-[radial-gradient(circle_at_17%_31%,rgb(255_255_255/28%)_0_0.55px,transparent_0.7px),radial-gradient(circle_at_73%_64%,rgb(255_255_255/22%)_0_0.45px,transparent_0.65px)] before:bg-[length:4px_4px,5px_5px]",
                    "before:bg-[position:0_0,7px_11px] before:opacity-[0.09] before:mix-blend-soft-light before:content-['']",
                    "after:pointer-events-none after:absolute after:inset-0 after:z-[2]",
                    "after:bg-[linear-gradient(90deg,rgb(0_0_0/30%),transparent_22%,transparent_76%,rgb(0_0_0/28%)),linear-gradient(180deg,rgb(0_0_0/22%),transparent_34%,transparent_78%,rgb(0_0_0/20%))] after:content-['']",
                ].join(" ")}
            >
                <div className="relative z-[3] mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 xl:px-16">
                    <div className="grid grid-cols-2 items-center gap-14 xl:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)] xl:gap-16">
                        <div className="max-w-[520px] xl:pt-6">
                            <h2 className="m-0 max-w-[520px] font-[family-name:var(--font-source-serif)] text-[clamp(2.75rem,4.5vw,4.25rem)] leading-[1.12] font-normal tracking-[-0.04em]">
                                <span className="block">Built around</span>

                                <span className="block">
                                    the{" "}
                                    <em className="text-[var(--landing-accent)] not-italic">
                                        thought
                                    </em>
                                    , not the toolbar
                                </span>
                            </h2>

                            <p className="mt-7 max-w-[500px] text-base leading-8 text-[#aaa8a4] sm:text-[17px] sm:leading-9">
                                Writely keeps everything out of your way so you can think
                                clearly. AI only sees the text you deliberately select, never
                                your entire document.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#373430] bg-[rgb(13_14_13/54%)]">
                            <table className="w-full table-fixed border-collapse">
                                <caption className="sr-only">
                                    Comparison between typical document editors and Writely
                                </caption>

                                <thead>
                                    <tr className="border-b border-[#302e2b] text-left text-[11px] font-medium tracking-[0.12em] text-[#8f8a84] uppercase sm:text-xs">
                                        <th
                                            scope="col"
                                            className="w-1/2 px-4 py-5 font-medium sm:px-5"
                                        >
                                            Typical document editor
                                        </th>

                                        <th
                                            scope="col"
                                            className="w-1/2 border-l border-[#302e2b] px-4 py-5 font-medium text-[var(--landing-accent)] sm:px-5"
                                        >
                                            Writely
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {comparisonRows.map((row) => (
                                        <tr
                                            key={row.typical}
                                            className="border-b border-[#302e2b] text-sm leading-6 last:border-b-0 sm:text-base"
                                        >
                                            <td className="px-4 py-5 align-middle break-words text-[#aaa6a1] sm:px-5 sm:py-6">
                                                {row.typical}
                                            </td>

                                            <td className="border-l border-[#302e2b] px-4 py-5 align-middle break-words text-[#f0ede9] sm:px-5 sm:py-6">
                                                {row.writely}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-12 grid min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-[#383531] bg-[rgb(12_13_12/56%)] lg:grid-cols-3">
                        {trustItems.map((item) => {
                            return (
                                <div
                                    key={item.title}
                                    className={[
                                        "landing-trustItem relative flex min-w-0",
                                        "items-center gap-5 p-6 sm:p-8",
                                        "lg:min-h-[150px] lg:px-7 xl:px-9 [&_p]:m-0",
                                        "[&_p]:min-w-0 [&_p_>_span]:mt-2 [&_p_>_span]:block [&_p_>_span]:text-[14px]",
                                        "[&_p_>_span]:leading-6 [&_p_>_span]:text-[#99958f] [&_strong]:block [&_strong]:[font-family:var(--font-source-serif),Georgia,serif]",
                                        "[&_strong]:text-[clamp(1.2rem,1.8vw,1.45rem)] [&_strong]:leading-[1.2] [&_strong]:font-normal [&_strong]:text-[#eae6e1]",
                                        "[&+.landing-trustItem::before]:absolute [&+.landing-trustItem::before]:top-0 [&+.landing-trustItem::before]:right-6 [&+.landing-trustItem::before]:left-6",
                                        "[&+.landing-trustItem::before]:h-px [&+.landing-trustItem::before]:bg-[#373430] [&+.landing-trustItem::before]:[content:''] lg:[&+.landing-trustItem::before]:top-8",
                                        "lg:[&+.landing-trustItem::before]:right-auto lg:[&+.landing-trustItem::before]:bottom-8 lg:[&+.landing-trustItem::before]:left-0 lg:[&+.landing-trustItem::before]:h-auto",
                                        "lg:[&+.landing-trustItem::before]:w-px",
                                    ].join(" ")}
                                >
                                    <span className="landing-trustIcon flex h-12 w-12 shrink-0 items-center justify-center text-(--landing-accent) [&_svg]:h-11 [&_svg]:w-11 [&_svg]:stroke-[1.25]">
                                        <LandingIcon name={item.icon as LandingIconName} />
                                    </span>
                                    <p>
                                        <strong>{item.title}</strong>
                                        <span>{item.children}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="final-cta-title"
                className={[
                    "[background:radial-gradient(ellipse_68%_30%_at_51%_69%,rgb(147_101_60/24%),transparent_69%),radial-gradient(circle_at_50%_42%,#151411_0,#090a09_43%,#040505_83%)] py-12",
                    "[&::after]:pointer-events-none [&::after]:absolute [&::after]:inset-0 [&::after]:z-2",
                    "[&::after]:[content:''] [&::after]:[background:linear-gradient(90deg,rgb(0_0_0/30%),transparent_22%,transparent_76%,rgb(0_0_0/28%)),linear-gradient(180deg,rgb(0_0_0/22%),transparent_34%,transparent_78%,rgb(0_0_0/20%))] [&::before]:pointer-events-none [&::before]:absolute",
                    "[&::before]:inset-0 [&::before]:z-1 [&::before]:bg-[radial-gradient(circle_at_17%_31%,rgb(255_255_255/28%)_0_0.55px,transparent_0.7px),radial-gradient(circle_at_73%_64%,rgb(255_255_255/22%)_0_0.45px,transparent_0.65px)] [&::before]:bg-size-[4px_4px,5px_5px]",
                    "[&::before]:bg-position-[0_0,7px_11px] [&::before]:opacity-[0.09] [&::before]:mix-blend-soft-light [&::before]:[content:'']",
                ].join(" ")}
            >
                <div className="landing-shell relative z-4 mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 xl:px-16">
                    <div
                        className={[
                            "landing-finalContent relative z-5 flex",
                            "min-h-[480px] flex-col items-center justify-center",
                            "py-12 text-center sm:min-h-[540px] [&_.landing-actionButton]:mt-10",
                            "[&_.landing-actionButton]:w-[min(282px,100%)]",
                        ].join(" ")}
                    >
                        <h2
                            id="final-cta-title"
                            className={[
                                "landing-finalTitle m-0 max-w-[920px] [font-family:var(--font-source-serif),Georgia,serif]",
                                "text-[clamp(2.8rem,5vw,4.5rem)] leading-[1.15] font-normal tracking-[-0.04em]",
                                "[&_em]:text-(--landing-accent) [&_em]:not-italic [&_span]:block",
                            ].join(" ")}
                        >
                            <span>Your next sentence</span>
                            <span>
                                deserves some <em>space</em>
                            </span>
                        </h2>
                        <ActionButton
                            onClick={() => {
                                void continueWithPassage("");
                            }}
                            disabled={isSessionPending || isSigningIn}
                        >
                            Start writing
                        </ActionButton>
                        <div
                            className={[
                                "landing-finalAssurances mt-8 flex flex-wrap",
                                "items-center justify-center gap-x-4 gap-y-3",
                                "text-[14px] text-[#b1a18f] [&_span]:inline-flex [&_span]:items-center",
                                "[&_span]:gap-2 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:stroke-[1.45]",
                                "[&_svg]:text-(--landing-accent)",
                            ].join(" ")}
                        >
                            <span>Free during beta</span>
                            <span aria-hidden="true">·</span>
                            <span>
                                Autosaved automatically
                            </span>
                        </div>
                    </div>

                    <footer
                        className={[
                            "landing-footer relative z-6",
                            "flex min-h-[76px] flex-col items-start",
                            "justify-end gap-5 border-t border-[#34322f]",
                            "text-[14px] text-[#9b9085] sm:flex-row",
                            "sm:items-end sm:justify-between [&_p]:m-0 [&_p_span]:[font-family:var(--font-source-serif),Georgia,serif]",
                            "[&_p_span]:text-xl [&_p_span]:text-(--landing-accent)",
                        ].join(" ")}
                    >
                        <p>
                            <span>Writely</span> · Beta
                        </p>
                        <LegalLinks className="landing-footerLinks flex-wrap gap-x-7 gap-y-3 [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:text-(--landing-text)" />
                    </footer>
                </div>
            </section>
        </main>
    );
}

function ActionButton({
    children,
    disabled,
    onClick,
}: {
    children: ReactNode;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={[
                "landing-actionButton inline-flex h-[62px] w-[min(260px,100%)]",
                "mt-10 cursor-pointer items-center justify-center gap-4 px-6",
                "rounded-[9px] border border-[rgb(244_183_105/55%)]",
                "[background:linear-gradient(105deg,#cb8536,#e7ab63_58%,#d58e3f)]",
                "text-[17px] font-medium text-[#20160e]",
                "shadow-[inset_0_1px_rgb(255_224_175/42%),0_18px_42px_rgb(121_70_28/22%)]",
                "transition-[filter,transform] duration-150",
                "disabled:cursor-wait motion-reduce:transition-none",
                "[&_svg]:h-[22px] [&_svg]:w-[22px] [&_svg]:stroke-[1.6]",
                "[&:hover]:-translate-y-px [&:hover]:brightness-110",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function SelectionToolbar({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={[
                "landing-toolbar flex min-w-0 items-center justify-between",
                "h-[56px] gap-3 px-4 py-2 sm:gap-6 sm:px-5",
                "rounded-xl border border-[#363430]",
                "bg-[linear-gradient(180deg,rgb(32_31_29/98%),rgb(25_24_22/98%)),#1c1b19]",
                "[font-family:var(--font-inter),sans-serif] text-[14px] leading-none text-[#ece9e4]",
                "shadow-[inset_0_1px_rgb(255_255_255/3%),0_16px_34px_rgb(0_0_0/26%)]",
                "[&_>_svg]:h-5 [&_>_svg]:w-5 [&_>_svg]:shrink-0",
                "[&_>_svg]:stroke-[1.35] [&_>_svg]:text-[#c1beba]",
                "[&_b]:font-bold [&_i]:font-semibold [&_i]:italic",
                className ?? "",
            ].join(" ")}
        >
            <b>B</b>
            <i>I</i>
            <b>H</b>
            <LandingIcon name="align" />
            <span className="landing-quote [font-family:var(--font-source-serif),Georgia,serif] text-[22px] text-[#c1beba]">
                “
            </span>
            <span
                className={[
                    "landing-aiTool inline-flex h-9 shrink-0",
                    "items-center gap-1.5 rounded-[9px] border",
                    "border-[#bb783a] bg-[linear-gradient(130deg,#cd8741,#e2aa66)] px-3 font-medium",
                    "text-[#20160e] shadow-[inset_0_1px_rgb(255_224_177/36%),0_7px_18px_rgb(0_0_0/24%)] [&_svg]:h-4 [&_svg]:w-4",
                    "[&_svg]:stroke-[1.55]",
                ].join(" ")}
            >
                AI
                <LandingIcon name="sparkle" />
            </span>
        </div>
    );
}

function LandingIcon({ name }: { name: LandingIconName }) {
    const commonProps = {
        "aria-hidden": true,
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        viewBox: "0 0 24 24",
    };

    switch (name) {
        case "ai":
            return (
                <svg {...commonProps}>
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                    <path d="M8.5 16 12 8l3.5 8M9.8 13h4.4M18 8v8" />
                </svg>
            );
        case "align":
            return (
                <svg {...commonProps}>
                    <path d="M5 7h14M5 12h14M5 17h10" />
                </svg>
            );
        case "arrow":
            return (
                <svg {...commonProps}>
                    <path d="M5 12h14M14 7l5 5-5 5" />
                </svg>
            );
        case "bolt":
            return (
                <svg {...commonProps}>
                    <path d="m13 2-8 12h7l-1 8 8-12h-7z" />
                </svg>
            );
        case "cloud":
            return (
                <svg {...commonProps}>
                    <path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.3 8.3 4.5 4.5 0 0 0 7 18Z" />
                </svg>
            );
        case "document":
            return (
                <svg {...commonProps}>
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h4" />
                </svg>
            );
        case "download":
            return (
                <svg {...commonProps}>
                    <rect x="4" y="3" width="16" height="18" rx="3" />
                    <path d="M12 7v9M8.5 12.5 12 16l3.5-3.5" />
                </svg>
            );
        case "folder":
            return (
                <svg {...commonProps}>
                    <path d="M3 7.5h7l2-2h9v13H3z" />
                    <path d="M3 7.5V6a2 2 0 0 1 2-2h5l2 2" />
                </svg>
            );
        case "format":
            return (
                <svg {...commonProps}>
                    <path d="M4 6h16M4 11h12M4 16h16M4 21h10" />
                </svg>
            );
        case "lock":
            return (
                <svg {...commonProps}>
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                </svg>
            );
        case "menu":
            return (
                <svg {...commonProps}>
                    <path d="M5 7h14M5 12h14M5 17h14" />
                </svg>
            );
        case "shield":
            return (
                <svg {...commonProps}>
                    <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6z" />
                </svg>
            );
        case "shield-check":
            return (
                <svg {...commonProps}>
                    <path d="M12 2.5 20 6v5.5c0 4.8-3.2 8.3-8 10.5-4.8-2.2-8-5.7-8-10.5V6z" />
                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                </svg>
            );
        case "sparkle":
            return (
                <svg {...commonProps}>
                    <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM18.5 13l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
                </svg>
            );
        case "toolbar":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="M7 9h3M14 9h3M7 13h3M14 13h3" />
                </svg>
            );
    }
}
