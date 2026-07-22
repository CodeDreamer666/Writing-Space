"use client";

import { useEffect } from "react";

type ShortcutHandlers = {
  onCreateDocument?: () => void;
  onSave?: () => void;
  onToggleFocus?: () => void;
  onOpenExport?: () => void;
  onEscape?: () => void;
};

function isUnrelatedFormField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const isEditable =
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement;

  return isEditable && !target.closest("[data-writely-editor]");
}

export function useWritelyShortcuts({
  onCreateDocument,
  onSave,
  onToggleFocus,
  onOpenExport,
  onEscape,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (
        !(event.ctrlKey || event.metaKey) ||
        isUnrelatedFormField(event.target)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      let handler: (() => void) | undefined;

      if (event.altKey && !event.shiftKey && key === "n") {
        handler = onCreateDocument;
      } else if (!event.altKey && !event.shiftKey && key === "s") {
        handler = onSave;
      } else if (event.altKey && !event.shiftKey && key === "f") {
        handler = onToggleFocus;
      } else if (event.altKey && !event.shiftKey && key === "e") {
        handler = onOpenExport;
      }

      if (!handler) {
        return;
      }

      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCreateDocument, onEscape, onOpenExport, onSave, onToggleFocus]);
}
