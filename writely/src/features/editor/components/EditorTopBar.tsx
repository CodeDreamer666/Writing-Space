"use client";

import { useUiLanguage } from "~/hooks/useUiLanguage";
import type { SaveStatus } from "../hooks/useDocumentAutosave";

type Props = {
    saveStatus: SaveStatus;
    isFocusMode: boolean;
    isExporting: boolean;
    onExport: () => void;
    onToggleFocus: () => void;
};

function saveStatusLabel(
    status: SaveStatus,
    t: ReturnType<typeof useUiLanguage>["t"],
) {
    if (status === "error") {
        return t("editor.saveFailed");
    }

    if (status === "saved") {
        return t("editor.saved");
    }

    if (status === "conflict") {
        return t("editor.resolveConflict");
    }

    if (status === "recovery") {
        return t("editor.recoveryAvailable");
    }

    if (status === "unsaved") {
        return t("editor.unsavedChanges");
    }

    return t("editor.saving");
}

const buttonClassName =
    "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)] disabled:cursor-not-allowed disabled:opacity-45";

export default function EditorTopBar({
    saveStatus,
    isFocusMode,
    isExporting,
    onExport,
    onToggleFocus,
}: Props) {
    const { t } = useUiLanguage();

    return (
        <header className="sticky top-0 z-30 border-b border-[var(--w-border-soft)] bg-[var(--w-background)]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-1.5">
                    {!isFocusMode && (
                        <span
                            role="status"
                            className={`truncate px-2 text-xs ${saveStatus === "error"
                                    ? "text-[#C96F5B]"
                                    : "text-[var(--w-subtle)]"
                                }`}
                        >
                            {saveStatusLabel(saveStatus, t)}
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    {!isFocusMode && (
                        <>
                            <button
                                type="button"
                                disabled={isExporting}
                                onClick={onExport}
                                className={buttonClassName}
                            >
                                {t("editor.export")}
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        aria-pressed={isFocusMode}
                        onClick={onToggleFocus}
                        className={`${buttonClassName} ${isFocusMode
                                ? "bg-[var(--w-surface-raised)] text-[var(--w-foreground)] hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
                                : ""
                            }`}
                    >
                        {isFocusMode ? t("editor.exitFocus") : t("editor.focus")}
                    </button>
                </div>
            </div>
        </header>
    );
}
