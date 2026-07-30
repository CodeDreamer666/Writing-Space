"use client";

import { useEffect, useRef } from "react";
import type { ExportFormat } from "~/server/documents/exportDocument";

type Props = {
  isOpen: boolean;
  isExporting: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
};

export default function ExportDialog({
  isOpen,
  isExporting,
  onClose,
  onExport,
}: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const formats: Array<{
    format: ExportFormat;
    label: string;
    description: string;
  }> = [
    { format: "txt", label: "TXT", description: "Plain text" },
    {
      format: "md",
      label: "Markdown",
      description: "Portable formatting",
    },
    {
      format: "docx",
      label: "Word",
      description: "Editable document",
    },
    {
      format: "pdf",
      label: "PDF",
      description: "Formatted, ready-to-share document",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close export dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="relative w-full max-w-md rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 shadow-2xl sm:p-6"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
            return;
          }

          if (event.key !== "Tab" || !dialogRef.current) {
            return;
          }

          const focusableElements = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
            ),
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements.at(-1);

          if (!firstElement || !lastElement) {
            return;
          }

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault();
            firstElement.focus();
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
              Current document
            </p>
            <h2
              id="export-title"
              className="mt-2 text-xl font-medium text-[var(--w-foreground)]"
            >
              Export your writing
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-[var(--w-muted)] hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
          >
            ×
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {formats.map(({ format, label, description }) => (
            <button
              key={format}
              type="button"
              disabled={isExporting}
              onClick={() => onExport(format)}
              className="cursor-pointer rounded-xl border border-[var(--w-border)] bg-[var(--w-background)] px-4 py-4 text-left transition-colors hover:bg-[var(--w-surface-raised)] disabled:cursor-wait disabled:opacity-60"
            >
              <span className="block text-sm font-medium text-[var(--w-foreground)]">
                {label}
              </span>
              <span className="mt-1 block text-xs text-[var(--w-muted)]">
                {description}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--w-subtle)]">
          Headings, lists, bold, italic, and line breaks are preserved where the
          format supports them.
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--w-subtle)]">
          PDF uses embedded Unicode-compatible fonts. Writely 2.0 guarantees
          reliable PDF export for English only.
        </p>
      </section>
    </div>
  );
}
