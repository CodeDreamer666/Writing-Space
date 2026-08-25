"use client";
import Link from "next/link";
import LimitRows from "~/components/settings/LimitRows";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useStatusMessage from "~/hooks/useStatusMessage";
import useTheme from "~/hooks/useTheme";
import {
    MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import {
    MAX_DOCUMENT_CHARACTERS,
    MAX_DOCUMENTS_PER_USER,
} from "~/lib/documentLimits";
import { THEMES, type Theme } from "~/lib/theme";
import useHandleTRPCError from "~/trpc/useHandleTRPCError";
import authClient from "~/server/better-auth/client";
import api from "~/trpc/api";
import AccountSettings from "~/components/settings/AccountSettings";
import Loading from "~/components/shared/Loading";
import SettingsSection from "~/components/settings/SettingsSection";
import WritingAppearanceSettings from "~/components/settings/WritingAppearanceSettings";

const themeLabels: Record<Theme, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
};

export default function SettingsPageContent() {
    const { theme, setTheme } = useTheme();
    const { showMessage } = useStatusMessage();
    const router = useRouter();
    const handleTRPCError = useHandleTRPCError();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const [message, setMessage] = useState("");

    const submitFeedback = api.feedback.submit.useMutation({
        onSuccess: () => {
            setMessage("");
            showMessage("Thank you — your feedback was received.", true);
        },
        onError: (error) => handleTRPCError({ error, router }),
    });

    if (isSessionLoading) {
        return <Loading />;
    }

    if (!session?.user) {
        return (
            <main className="min-h-screen bg-(--w-background) px-5 py-20 text-center text-(--w-foreground)">
                <p>
                    Please sign in from the Writely home page before going to the settings
                    page.
                </p>
                <Link
                    href="/"
                    className="font-mono-label mt-6 inline-block border-b border-(--w-border) py-1 text-[11px] tracking-[0.18em] uppercase"
                >
                    ← Back to Writely
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-(--w-background) text-(--w-foreground)">
            <header className="flex items-center justify-between border-b border-(--w-border-soft) px-5 py-5 sm:px-10 sm:py-6">
                <span className="font-mono-label text-[11px] tracking-[0.24em] text-(--w-subtle) uppercase">
                    Writely
                </span>
                <Link
                    href="/app"
                    className="font-mono-label border-b border-(--w-border) py-1 text-[11px] tracking-[0.18em] uppercase hover:border-(--w-foreground)"
                >
                    ← Back to Writely
                </Link>
            </header>

            <article className="mx-auto max-w-[960px] px-5 pb-24 sm:px-5">
                <header className="border-b border-(--w-foreground) py-8 sm:pb-12">
                    <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.04] font-light tracking-[-0.03em]">
                        Settings &amp; Help
                    </h1>
                    <p className="mt-[22px] max-w-[40ch] text-base leading-[1.7] text-(--w-muted)">
                        Personalize Writely and find important information.
                    </p>
                </header>

                <SettingsSection title="Theme">
                    <p>
                        Choose Light, Dark, or System. System follows your device setting.
                    </p>
                    <fieldset className="mt-5">
                        <legend className="sr-only">Choose a theme</legend>
                        <div className="flex w-fit border border-(--w-foreground)">
                            {THEMES.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    suppressHydrationWarning
                                    aria-pressed={theme === option}
                                    onClick={() => setTheme(option)}
                                    className={`h-[46px] cursor-pointer border-0 px-4 text-sm sm:px-6 ${theme === option ? "bg-(--w-foreground) font-medium text-(--w-background)" : "bg-transparent text-(--w-subtle)"}`}
                                >
                                    {themeLabels[option]}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    <p className="font-mono-label mt-4 text-[10px] tracking-[0.14em] text-(--w-subtle) uppercase">
                        {theme === "system"
                            ? "Following your device setting"
                            : "Applied across every screen"}
                    </p>
                </SettingsSection>

                <SettingsSection title="Writing appearance">
                    <p>
                        Adjust how your writing looks inside the editor. These choices
                        affect only the editor. Exported documents keep their normal
                        document formatting.
                    </p>
                    <WritingAppearanceSettings />
                </SettingsSection>

                <SettingsSection title="Saving">
                    <p>
                        Save your current draft from the document sidebar. Writely shows
                        when changes are unsaved, saving, saved, or need your attention.
                    </p>
                    <p className="mt-4">
                        A temporary browser recovery copy helps protect recent writing when
                        saving fails or the tab closes unexpectedly.
                    </p>
                </SettingsSection>

                <SettingsSection title="AI usage">
                    <LimitRows
                        rows={[
                            ["Daily allowance", "Generous everyday use"],
                            [
                                "Selected characters per request",
                                MAX_AI_SELECTION_CHARACTERS.toLocaleString("en"),
                            ],
                            ["Concurrent requests", "1"],
                            ["Sent to AI", "Selected text only"],
                        ]}
                    />
                    <p className="mt-[18px] text-sm leading-[1.7] text-(--w-subtle)">
                        Everyday writing sessions comfortably fit within your Writely
                        allowance, and failed or invalid responses do not reduce it.
                    </p>
                </SettingsSection>

                <SettingsSection title="Language support">
                    <p>
                        Writely’s interface is in English. You can write and paste text in
                        other languages, but Writely 2.0 officially guarantees support only
                        for English.
                    </p>
                    <p className="mt-4">
                        Emoji and decorative pictographs are not supported in document
                        titles or writing. Normal punctuation, numbers, and useful symbols
                        remain supported.
                    </p>
                </SettingsSection>

                <SettingsSection title="Document limits">
                    <LimitRows
                        rows={[
                            ["Documents", MAX_DOCUMENTS_PER_USER.toLocaleString("en")],
                            [
                                "Characters per document",
                                MAX_DOCUMENT_CHARACTERS.toLocaleString("en"),
                            ],
                        ]}
                    />
                </SettingsSection>

                <SettingsSection title="Export">
                    <p>Export documents as TXT, Markdown, Word, or PDF.</p>
                    <div className="mt-[18px] flex w-fit max-w-full overflow-x-auto border border-(--w-border)">
                        {["TXT", "MD", "DOCX", "PDF"].map((format) => (
                            <span
                                key={format}
                                className="font-mono-label border-r border-(--w-border) px-[18px] py-3 text-[11px] tracking-[0.14em] last:border-r-0"
                            >
                                {format}
                            </span>
                        ))}
                    </div>
                </SettingsSection>

                <div id="feedback" className="scroll-mt-8">
                    <SettingsSection title="Send feedback">
                        <p>
                            Tell us what is working well, what feels unclear, or what could
                            make Writely better. Your feedback helps guide improvements during
                            the beta.
                        </p>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                if (
                                    !submitFeedback.isPending &&
                                    message.trim().length >= 10 &&
                                    message.length <= 2_000
                                )
                                    submitFeedback.mutate({ message });
                            }}
                            className="mt-5"
                        >
                            <label
                                htmlFor="feedback-message"
                                className="font-mono-label block text-[10px] tracking-[0.16em] text-(--w-subtle) uppercase"
                            >
                                What worked, or what should feel better?
                            </label>
                            <textarea
                                id="feedback-message"
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value.slice(0, 2_000))
                                }
                                minLength={10}
                                maxLength={2_000}
                                rows={5}
                                required
                                placeholder="Tell us about your experience…"
                                className="mt-2.5 w-full resize-none rounded-none border border-(--w-border) bg-(--w-background) p-3.5 text-sm leading-[1.7] text-(--w-foreground) outline-none placeholder:text-(--w-subtle) focus:border-(--w-foreground)"
                            />
                            <div className="mt-3 flex items-center justify-between gap-5">
                                <span className="font-mono-label text-[11px]">
                                    {message.length.toLocaleString()} / 2,000
                                </span>
                                <button
                                    type="submit"
                                    disabled={
                                        submitFeedback.isPending ||
                                        message.trim().length < 10 ||
                                        message.length > 2_000
                                    }
                                    className="h-11 cursor-pointer bg-(--w-foreground) px-[22px] text-[13px] font-medium text-(--w-background) disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitFeedback.isPending ? "Sending…" : "Send feedback"}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>
                </div>

                <AccountSettings />
            </article>
        </main>
    );
}
