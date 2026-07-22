"use client";

import { useEffect, useState } from "react";
import { downloadDemoExport } from "./exportDemoDocument";

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
    <div className="overflow-hidden rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] shadow-2xl shadow-black/15">
      <div className="px-6 py-9 sm:px-10 sm:py-12">
        <p className="text-2xl font-medium sm:text-3xl">The shape of an idea</p>
        <div
          className={`${writingClass} mt-4 min-h-[116px] leading-8 text-[var(--w-muted)] transition-all duration-200`}
          aria-live="polite"
        >
          {activeFormats.includes("List") ? (
            <ul className="list-disc space-y-1 pl-8">
              <li>Let the interface grow quiet around the words.</li>
              <li>Begin with the thought.</li>
              <li>Shape the language at your own pace.</li>
            </ul>
          ) : (
            <p>
              Writing becomes clearer when the interface grows quiet around it.
              Begin with the thought. Then shape the language at your own pace.
            </p>
          )}
        </div>
        <div
          className="mt-9 flex flex-wrap gap-1.5 border-t border-[var(--w-border-soft)] pt-4"
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
                    ? "cursor-pointer rounded-md border border-[var(--w-foreground)] bg-[var(--w-foreground)] px-2.5 py-1.5 text-[10px] text-[var(--w-background)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
                    : "cursor-pointer rounded-md border border-[var(--w-border)] px-2.5 py-1.5 text-[10px] text-[var(--w-subtle)] transition-colors hover:border-[var(--w-muted)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
                }
              >
                {button}
              </button>
            );
          })}
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
    <div className="mt-10 grid overflow-hidden rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] lg:grid-cols-[1fr_1fr_250px]">
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
      <div className="border-t border-[var(--w-border-soft)] p-5 lg:border-t-0 lg:border-l">
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
                  ? "mt-3 w-full cursor-pointer rounded-lg border border-[var(--w-foreground)] bg-[var(--w-foreground)] px-3 py-3 text-left text-sm text-[var(--w-background)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)]"
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
      className={
        isFocused
          ? `relative z-10 rounded-2xl border border-transparent bg-[var(--w-background)] shadow-[0_0_0_999px_color-mix(in_srgb,var(--w-background)_72%,transparent)] transition-all duration-300 ${expanded ? "p-6 sm:p-8" : "mt-7 rounded-xl p-4"}`
          : `rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] transition-all duration-300 ${expanded ? "p-6 sm:p-8" : "mt-7 rounded-xl p-4"}`
      }
    >
      <div className="flex items-center justify-between text-[10px]">
        <button
          type="button"
          aria-pressed={isFocused}
          onClick={() => setIsFocused((current) => !current)}
          className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-foreground)] ${
            isFocused
              ? "border-[var(--w-foreground)] bg-[var(--w-foreground)] text-[var(--w-background)]"
              : "border-[var(--w-border)] text-[var(--w-subtle)] hover:border-[var(--w-muted)] hover:text-[var(--w-foreground)]"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isFocused ? "bg-[var(--w-background)]" : "bg-[var(--w-subtle)]"
            }`}
          />
          {isFocused ? "Exit Focus Mode" : "Enter Focus Mode"}
        </button>
      </div>
      <p
        className={`mx-auto transition-all duration-300 ${expanded ? "mt-16 max-w-md text-2xl leading-10 sm:mt-20" : "mt-10 max-w-[210px] text-lg leading-8"} ${isFocused ? "scale-[1.03] text-[var(--w-foreground)]" : "text-[var(--w-muted)]"}`}
      >
        One clear page, with everything else fading into the background. Nothing
        competes with the sentence in front of you.
      </p>
      <div className={expanded ? "h-16 sm:h-20" : "h-9"} />
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

  const selectFormat = async (format: ExportFormat) => {
    if (isExporting) {
      return;
    }

    setSelectedFormat(format);
    setIsExporting(true);

    try {
      await downloadDemoExport(exportFormatValues[format]);
    } catch {
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
        <h2
          className={`${expanded ? "text-sm" : "text-[10px]"} font-semibold text-[var(--w-foreground)]`}
        >
          Project brief
        </h2>
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
