"use client";
import SettingsSection from "./SettingsSection";
import Link from "next/link";
import { useTheme } from "~/components/layout/ThemeProvider";
import {
    DAILY_AI_TOKEN_LIMIT,
    MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import {
    MAX_DOCUMENT_CHARACTERS,
    MAX_DOCUMENTS_PER_USER,
} from "~/lib/documentLimits";
import { THEMES, type Theme } from "~/lib/theme";
import AccountSettings from "./AccountSettings";
import WritingAppearanceSettings from "./WritingAppearanceSettings";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { showMessage } = useStatusMessage();
    const router = useRouter();
    const handleTRPCError = useHandleTRPCError();
    const { data: session } = authClient.useSession();
    const [message, setMessage] = useState("");

    const submitFeedback = api.feedback.submit.useMutation({
        onSuccess: () => {
            setMessage("");
            showMessage("Thank you — your feedback was received.", true);
        },
        onError: (error) => {
            handleTRPCError({ error, router });
        },
    });

    const themeLabels: Record<Theme, string> = {
        light: "Light",
        dark: "Dark",
        system: "System",
    };

    if (!session?.user) {
        return (
            <p className="mt-5 rounded-xl border border-(--w-border) bg-(--w-surface) px-4 py-3">
                Please sign in from the Writely home page before going to the setting page
            </p>
        );
    }

    return (
        <main className="min-h-screen bg-(--w-background) px-6 py-10 text-(--w-foreground) sm:px-8 sm:py-14">
            <article className="mx-auto max-w-3xl pb-8">
                <header className="mt-4 border-b border-(--w-border-soft) pb-10">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-xs font-medium tracking-[0.14em] text-(--w-subtle) uppercase">
                            Writely beta
                        </p>
                        <Link
                            href="/"
                            className="text-sm text-(--w-muted) transition-colors hover:text-(--w-foreground)"
                        >
                            ← Back to Writely
                        </Link>
                    </div>
                    <div>
                        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                            Settings &amp; Help
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-8 text-(--w-muted)">
                            Personalize Writely and find important information.
                        </p>
                    </div>
                </header>

                <div className="divide-y divide-(--w-border-soft)">
                    <SettingsSection title="Theme">
                        <p>Choose Light, Dark, or System.</p>
                        <div className="mt-5">
                            <fieldset>
                                <legend className="sr-only">Choose a theme</legend>
                                <div className="grid max-w-md grid-cols-3 gap-2 rounded-xl border border-(--w-border) bg-(--w-surface) p-1.5">
                                    {THEMES.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            suppressHydrationWarning
                                            aria-pressed={theme === option}
                                            onClick={() => setTheme(option)}
                                            className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors ${theme === option
                                                    ? "bg-(--w-foreground) text-(--w-background)"
                                                    : "text-(--w-muted) hover:bg-(--w-surface-raised) hover:text-(--w-foreground)"
                                                }`}
                                        >
                                            {themeLabels[option]}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                        <p className="mt-4 text-xs text-(--w-subtle)">
                            System follows your device setting.
                        </p>
                    </SettingsSection>

                    <SettingsSection title="Writing appearance">
                        <p>Adjust how your writing looks inside the editor.</p>
                        <WritingAppearanceSettings />
                        <p className="mt-4 text-xs text-(--w-subtle)">
                            These choices affect only the editor. Exported documents keep
                            their normal document formatting.
                        </p>
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
                                {DAILY_AI_TOKEN_LIMIT.toLocaleString("en")} tokens each day
                            </li>
                            <li>
                                Up to {MAX_AI_SELECTION_CHARACTERS.toLocaleString("en")}{" "}
                                selected characters per request
                            </li>
                            <li>One request at a time</li>
                            <li>Only selected text is sent to AI</li>
                        </ul>
                        <p className="mt-4">
                            Failed or invalid responses do not reduce your Writely allowance.
                        </p>
                    </SettingsSection>

                    <SettingsSection title="Language support">
                        <p>
                            Writely’s interface is in English. You can write and paste text in
                            other languages, but Writely 2.0 officially guarantees support
                            only for English.
                        </p>
                        <p className="mt-4">
                            Emoji and decorative pictographs are not supported in document
                            titles or writing. Normal punctuation, numbers, and useful symbols
                            remain supported.
                        </p>
                    </SettingsSection>

                    <SettingsSection title="Document limits">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                Up to {MAX_DOCUMENTS_PER_USER.toLocaleString("en")} documents
                            </li>
                            <li>
                                Up to {MAX_DOCUMENT_CHARACTERS.toLocaleString("en")} characters
                                per document
                            </li>
                        </ul>
                    </SettingsSection>

                    <SettingsSection title="Export">
                        <p>Export documents as TXT, Markdown, Word, or PDF.</p>
                    </SettingsSection>

                    <div id="feedback" className="scroll-mt-8">
                        <SettingsSection title="Send feedback">
                            <p>
                                Tell us what is working well, what feels unclear, or what could
                                make Writely better. Your feedback helps guide improvements
                                during the beta.
                            </p>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    if (!session?.user || submitFeedback.isPending) {
                                        return;
                                    }

                                    submitFeedback.mutate({ message });
                                }}
                                className="mt-5"
                            >
                                <label
                                    htmlFor="feedback-message"
                                    className="text-sm font-medium text-(--w-strong)"
                                >
                                    What worked, or what should feel better?
                                </label>
                                <textarea
                                    id="feedback-message"
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    minLength={10}
                                    maxLength={2_000}
                                    rows={6}
                                    required
                                    placeholder="Tell us about your experience…"
                                    className={[
                                        "mt-2 w-full resize-none rounded-xl",
                                        "border border-(--w-border) bg-(--w-surface) px-3",
                                        "py-3 text-sm leading-6 text-(--w-foreground)",
                                        "ring-0 outline-none placeholder:text-(--w-subtle) focus:border-0",
                                        "focus:border-(--w-strong) focus:ring-0 focus:outline-none",
                                    ].join(" ")}
                                />
                                <div className="mt-2 flex items-center justify-between gap-4">
                                    <span className="text-xs text-(--w-subtle)">
                                        {message.length.toLocaleString()} / 2,000
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={
                                            submitFeedback.isPending || message.trim().length < 10
                                        }
                                        className="min-h-10 cursor-pointer rounded-lg bg-(--w-foreground) px-4 text-xs font-medium text-(--w-background) disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {submitFeedback.isPending ? "Sending…" : "Send feedback"}
                                    </button>
                                </div>
                            </form>
                        </SettingsSection>
                    </div>

                    <AccountSettings />
                </div>
            </article>
        </main>
    );
}
