"use client";

import { useEffect, useState } from "react";

const formatButtons = ["Bold", "Italic", "List"] as const;
const exportFormats = ["TXT", "Markdown", "PDF", "Word"] as const;
const exportFormatValues = {
    TXT: "txt",
    Markdown: "md",
    PDF: "pdf",
    Word: "docx",
} as const;

const aiActions = {
    "Improve clarity": {
        result:
            "We discussed several decisions during the long meeting and clarified the next steps.",
        explanation: "Vague wording clarified · next steps made explicit",
    },
    "Make more concise": {
        result: "The meeting ran long as we worked through several topics.",
        explanation: "Repetition removed · meaning preserved",
    },
    "Improve flow": {
        result:
            "The meeting ran long, but together we worked through each topic in turn.",
        explanation: "Ideas connected · rhythm smoothed",
    },
} as const;

type AiAction = keyof typeof aiActions;
type ExportFormat = (typeof exportFormats)[number];
type FormatButton = (typeof formatButtons)[number];
type SaveState = "saved" | "saving" | "recovered";

export function EditorPreview() {
    const [activeFormats, setActiveFormats] = useState<FormatButton[]>([]);

    const toggleFormat = (format: FormatButton) => {
        setActiveFormats((currentFormats) => {
            const isActive = currentFormats.includes(format);

            return isActive
                ? currentFormats.filter((currentFormat) => currentFormat !== format)
                : [...currentFormats, format];
        });
    };

    const writingClass = [
        activeFormats.includes("Bold") ? "font-semibold" : "font-normal",
        activeFormats.includes("Italic") ? "italic" : "not-italic",
    ].join(" ");

    return (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--w-border)] bg-[var(--w-surface)] shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-[var(--w-border-soft)] px-5 py-3.5 text-[11px] text-[var(--w-subtle)]">
                <span className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-md bg-[var(--w-foreground)] text-[10px] font-semibold text-[var(--w-background)]">
                        W
                    </span>
                    New Draft
                </span>
                <span className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[var(--landing-accent)]" />
                    Saved
                </span>
            </div>

            <div className="bg-[var(--w-background)]/55 p-5 sm:p-7">
                <div className="relative min-h-[330px] rounded-2xl border border-[var(--w-border-soft)] bg-[var(--w-surface)] px-7 py-8 shadow-lg shadow-black/10 sm:px-10 sm:py-10">
                    <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
                        Personal essay
                    </p>
                    <p className="mt-4 text-2xl font-medium tracking-[-0.025em] sm:text-3xl">
                        The shape of an idea
                    </p>
                    <div
                        className={`${writingClass} mt-5 min-h-[128px] text-[15px] leading-8 text-[var(--w-muted)] transition-all duration-200`}
                        aria-live="polite"
                    >
                        {activeFormats.includes("List") ? (
                            <ul className="list-disc space-y-1 pl-6 marker:text-[var(--landing-accent)]">
                                <li>Let the interface grow quiet around the words.</li>
                                <li>Begin with the thought.</li>
                                <li>Shape the language at your own pace.</li>
                            </ul>
                        ) : (
                            <p>
                                A good idea rarely arrives finished. It needs a quiet place to
                                become clear—one sentence, then another, until the shape of it
                                begins to hold.
                            </p>
                        )}
                    </div>

                    <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 border-t border-[var(--w-border-soft)] pt-4 sm:right-8 sm:left-8">
                        <div
                            className="flex flex-wrap gap-1.5"
                            aria-label="Formatting demo"
                        >
                            {formatButtons.map((button) => {
                                const isActive = activeFormats.includes(button);

                                return (
                                    <button
                                        key={button}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => toggleFormat(button)}
                                        className={
                                            isActive
                                                ? "cursor-pointer rounded-md border border-[var(--landing-accent)] bg-[var(--landing-accent-soft)] px-2.5 py-1.5 text-[10px] text-[var(--w-foreground)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
                                                : "cursor-pointer rounded-md border border-[var(--w-border)] px-2.5 py-1.5 text-[10px] text-[var(--w-subtle)] transition-colors hover:border-[var(--w-muted)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
                                        }
                                    >
                                        {button}
                                    </button>
                                );
                            })}
                        </div>
                        <span className="hidden text-[10px] text-[var(--w-subtle)] sm:inline">
                            38 words
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AiRewriteDemo() {
    const [selectedAction, setSelectedAction] =
        useState<AiAction>("Make more concise");
    const selectedRewrite = aiActions[selectedAction];

    return (
        <div className="mt-12 grid overflow-hidden rounded-3xl border border-[var(--w-border)] bg-[var(--w-surface)] shadow-2xl shadow-black/10 lg:grid-cols-[1fr_1fr_250px]">
            <WritingSample
                label="Original"
                text="The meeting was long and there were many different things that we discussed together."
            />
            <WritingSample
                label={`Improved · ${selectedAction}`}
                text={selectedRewrite.result}
                explanation={selectedRewrite.explanation}
                improved
            />
            <div className="border-t border-[var(--w-border-soft)] bg-[var(--w-background)]/45 p-5 lg:border-t-0 lg:border-l">
                <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
                    Selected text
                </p>
                {(Object.keys(aiActions) as AiAction[]).map((action) => {
                    const isSelected = action === selectedAction;

                    return (
                        <button
                            key={action}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedAction(action)}
                            className={
                                isSelected
                                    ? "mt-3 w-full cursor-pointer rounded-lg border border-[var(--landing-accent)] bg-[var(--landing-accent-soft)] px-3 py-3 text-left text-sm text-[var(--w-foreground)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
                                    : "mt-3 w-full cursor-pointer rounded-lg border border-[var(--w-border)] px-3 py-3 text-left text-sm text-[var(--w-muted)] transition-colors hover:border-[var(--w-muted)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
                            }
                        >
                            {action}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function FocusModeDemo({ expanded = false }: { expanded?: boolean }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div
            className={`relative overflow-hidden rounded-3xl border shadow-lg shadow-black/10 border-[var(--w-border)] bg-[var(--w-surface)] transition-all duration-300 ${isFocused ? "border-[var(--w-border)]" : "border-[var(--w-border)]"} ${expanded ? "min-h-[430px]" : "mt-7 min-h-[360px]"}`}
        >
            <div
                className={`relative z-30 flex items-center justify-between border-b border-[var(--w-border-soft)] bg-[var(--w-surface)] px-5 py-3.5 text-[11px] transition-opacity duration-300 ${isFocused ? "opacity-0" : "opacity-100"}`}
                aria-hidden={isFocused}
            >
                <span className={`flex items-center gap-2.5 text-[var(--w-subtle)]`}>
                    <span className="flex size-6 items-center justify-center rounded-md bg-[var(--w-foreground)] text-[10px] font-semibold text-[var(--w-background)]">
                        W
                    </span>
                    A quieter way to write
                </span>
                <span className="flex items-center gap-2 text-[var(--w-subtle)]">
                    <span className="size-1.5 rounded-full bg-[var(--landing-accent)]" />
                    Saved
                </span>
            </div>

            <div
                className={`absolute inset-0 shadow-black/20 shadow-2xl transition-[background-color,opacity] duration-300 ${isFocused ? "bg-[var(--w-background)] opacity-70" : "pointer-events-none bg-[var(--w-background)]/55 opacity-100"}`}
                aria-hidden="true"
            />

            <div
                className={`relative transition-all duration-300 ${expanded ? "p-5 sm:p-7" : "p-4"}`}
            >
                <article
                    className={`relative z-40 mx-auto rounded-2xl border bg-[var(--w-surface)] px-7 pt-9 pb-6 transition-all duration-300 sm:px-10 ${isFocused ? "max-w-[600px] border-[var(--w-border-soft)] shadow-black/20" : "max-w-[600px] border-[var(--w-border-soft)]"}`}
                    aria-label="Read-only Writely document preview"
                >
                    <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
                        Writing note
                    </p>
                    <h3 className="mt-3 max-w-md text-2xl font-medium tracking-[-0.025em] text-[var(--w-foreground)]">
                        Make room for the thought
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-[var(--w-muted)]">
                        Writely keeps the page calm while autosave works quietly in the
                        background. Your drafts stay private, and you decide when a passage
                        needs help.
                    </p>

                    <p className="mt-4 text-sm leading-7 text-[var(--w-muted)]">
                        When you want support, select only the text that needs it.
                        Writely offers a suggestion; you choose what belongs in the
                        document.
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--w-border-soft)] pt-4">
                        <button
                            type="button"
                            aria-pressed={isFocused}
                            onClick={() => setIsFocused(!isFocused)}
                            className={` flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)] ${isFocused
                                ? "border-[var(--landing-accent)] bg-[var(--landing-accent-soft)] text-[var(--w-foreground)]"
                                : "border-[var(--w-border)] bg-[var(--w-surface)] text-[var(--w-subtle)] hover:border-[var(--w-muted)] hover:text-[var(--w-foreground)]"
                                }`}
                        >
                            {isFocused ? "Exit Focus Mode" : "Enter Focus Mode"}
                        </button>
                        <span className="hidden text-[10px] text-[var(--w-subtle)] sm:inline">
                            51 words
                        </span>
                    </div>
                </article>
            </div>
        </div>
    );
}

export function AutosaveDemo({ expanded = false }: { expanded?: boolean }) {
    const [draft, setDraft] = useState(
        "A good idea often arrives before the right words do. I want a quiet place where I can keep writing, shape the thought slowly, and return to it without worrying about losing my progress.",
    );
    const [saveState, setSaveState] = useState<SaveState>("saved");

    useEffect(() => {
        if (saveState !== "saving") {
            return;
        }

        const saveTimer = window.setTimeout(() => setSaveState("saved"), 700);

        return () => window.clearTimeout(saveTimer);
    }, [draft, saveState]);

    const statusText =
        saveState === "saving"
            ? "Saving…"
            : saveState === "recovered"
                ? "Recovery copy kept"
                : "Saved";

    return (
        <div
            className={
                expanded
                    ? "space-y-3 rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 sm:p-6"
                    : "mt-7 space-y-3"
            }
        >
            <label className="block">
                <span className="sr-only">Autosave demo writing</span>
                <textarea
                    value={draft}
                    rows={2}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        setSaveState("saving");
                    }}
                    className={`block w-full resize-none rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] text-[var(--w-foreground)] transition-colors outline-none placeholder:text-[var(--w-subtle)] focus:border-[var(--w-muted)] ${expanded ? "h-28 px-4 py-4 text-sm leading-6" : "h-[52px] px-3 py-2 text-xs leading-5"}`}
                    placeholder="Type a line…"
                />
            </label>
            <div
                className={`flex items-center justify-between rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] text-xs ${expanded ? "px-4 py-4" : "px-3 py-3"}`}
            >
                <span className="text-[var(--w-subtle)]">Local draft</span>
                <span
                    data-testid="autosave-demo-status"
                    className="flex items-center gap-2 text-[var(--w-strong)]"
                    aria-live="polite"
                >
                    <span
                        className={`size-1.5 rounded-full ${saveState === "recovered" ? "bg-[#C96F5B]" : "bg-[var(--w-foreground)]"}`}
                    />
                    {statusText}
                </span>
            </div>
            <button
                type="button"
                onClick={() => setSaveState("recovered")}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] text-xs text-[var(--w-subtle)] transition-colors hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)] ${expanded ? "px-4 py-4" : "px-3 py-3"}`}
            >
                <span>Try a failed save</span>
                <span>Keep recovery copy</span>
            </button>
        </div>
    );
}

export function ExportDemo({ expanded = false }: { expanded?: boolean }) {
    const [selectedFormat, setSelectedFormat] =
        useState<ExportFormat>("Markdown");
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState("");

    const selectFormat = async (format: ExportFormat) => {
        if (isExporting) {
            return;
        }

        setSelectedFormat(format);
        setIsExporting(true);
        setExportStatus("");

        try {
            const { downloadDemoExport } = await import("./exportDemoDocument");
            await downloadDemoExport(exportFormatValues[format]);
            setExportStatus(`${format} download started`);
        } catch {
            setExportStatus(`${format} export failed. Please try again.`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div
            className={
                expanded
                    ? "rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 sm:p-6"
                    : "mt-7"
            }
        >
            <div
                className={`rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] ${expanded ? "h-28 px-5 py-5" : "h-[58px] px-3 py-2.5"}`}
            >
                <p
                    className={`export-preview-title ${expanded ? "text-sm" : "text-[10px]"} font-semibold text-[var(--w-foreground)]`}
                >
                    Project brief
                </p>
                <p
                    className={`${expanded ? "mt-3 text-xs leading-5" : "mt-1 text-[9px]"} text-[var(--w-subtle)]`}
                >
                    The draft is ready to share.
                </p>
                <p
                    className={`${expanded ? "text-xs leading-5" : "text-[9px]"} text-[var(--w-subtle)]`}
                >
                    <strong>Key ideas</strong> stay clear; <em>your voice</em> remains.
                </p>
            </div>
            <div className={`${expanded ? "mt-3" : "mt-2"} grid grid-cols-2 gap-2`}>
                {exportFormats.map((format) => {
                    const isSelected = format === selectedFormat;

                    return (
                        <button
                            key={format}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                                void selectFormat(format);
                            }}
                            className={
                                isSelected
                                    ? `cursor-pointer rounded-lg border border-[var(--w-foreground)] bg-[var(--w-foreground)] px-3 text-center text-xs font-medium text-[var(--w-background)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)] ${expanded ? "py-3.5" : "py-2"}`
                                    : `cursor-pointer rounded-lg border border-[var(--w-border)] bg-[var(--w-background)] px-3 text-center text-xs font-medium text-[var(--w-strong)] transition-colors hover:border-[var(--w-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)] ${expanded ? "py-3.5" : "py-2"}`
                            }
                        >
                            {format}
                        </button>
                    );
                })}
            </div>
            <p
                aria-live="polite"
                className="mt-3 min-h-5 text-xs text-[var(--w-subtle)]"
            >
                {exportStatus}
            </p>
        </div>
    );
}

function WritingSample({
    label,
    text,
    explanation,
    improved = false,
}: {
    label: string;
    text: string;
    explanation?: string;
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
                aria-live={improved ? "polite" : undefined}
            >
                {text}
            </p>
            {improved && (
                <p className="mt-6 text-xs text-[var(--w-subtle)]">{explanation}</p>
            )}
        </div>
    );
}
