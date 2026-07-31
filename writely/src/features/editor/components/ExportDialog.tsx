"use client";

import type { ExportFormat } from "~/server/documents/exportDocument";

type Props = {
  isOpen: boolean;
  isExporting: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
};

const formats: Array<{
  format: ExportFormat;
  label: string;
  description: string;
}> = [
  { format: "txt", label: "TXT", description: "Plain text" },
  { format: "md", label: "Markdown", description: "Portable formatting" },
  { format: "docx", label: "Word", description: "Editable document" },
  {
    format: "pdf",
    label: "PDF",
    description: "Formatted, ready-to-share document",
  },
];

export default function ExportDialog({
  isOpen,
  isExporting,
  onClose,
  onExport,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close export dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="relative w-full max-w-md rounded-2xl border border-(--w-border) bg-(--w-surface) p-5 shadow-2xl sm:p-6"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase">
              Current document
            </p>
            <h2
              id="export-title"
              className="mt-2 text-xl font-medium text-(--w-foreground)"
            >
              Export your writing
            </h2>
          </div>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close export dialog"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-(--w-muted) hover:bg-(--w-surface-raised) hover:text-(--w-foreground)"
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
              className={[
                "cursor-pointer rounded-xl border border-(--w-border)",
                "bg-(--w-background) px-4 py-4 text-left",
                "transition-colors hover:bg-(--w-surface-raised) disabled:cursor-wait disabled:opacity-60",
              ].join(" ")}
            >
              <span className="block text-sm font-medium text-(--w-foreground)">
                {label}
              </span>
              <span className="mt-1 block text-xs text-(--w-muted)">
                {description}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-(--w-subtle)">
          Headings, lists, bold, italic, and line breaks are preserved where the
          format supports them.
        </p>
        <p className="mt-2 text-xs leading-5 text-(--w-subtle)">
          PDF uses embedded Unicode-compatible fonts. Writely 2.0 guarantees
          reliable PDF export for English only.
        </p>
      </section>
    </div>
  );
}
