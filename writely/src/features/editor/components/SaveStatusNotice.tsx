import { useState } from "react";
import type { SaveStatus } from "../hooks/useDocumentAutosave";

type Props = {
    status: SaveStatus;
    onRetry: () => void;
    onOpenSavedVersion: () => void;
};

export default function SaveStatusNotice({
    status,
    onRetry,
    onOpenSavedVersion,
}: Props) {
    const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

    if (status !== "error" && status !== "conflict") {
        return null;
    }

    const isConflict = status === "conflict";

    return (
        <aside
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-xl border border-[#70463E] bg-[#211713] px-4 py-3 text-sm text-[#F1C6BA] sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="leading-relaxed">
                {isConflict
                    ? isConfirmingDiscard
                        ? "Discard these recovered browser edits and open the newer saved version? This cannot be undone."
                        : "A newer saved version exists. These recovered edits are still in this browser and have not overwritten it."
                    : "Writely could not save. Your latest edits are still kept in this browser."}
            </p>
            {isConflict && isConfirmingDiscard ? (
                <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setIsConfirmingDiscard(false)}
                        className="min-h-11 cursor-pointer rounded-lg border border-[#8D5A4E] px-3 text-xs font-medium text-[#F8DDD6] transition-colors hover:bg-[#3A241F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1C6BA]"
                    >
                        Keep recovered edits
                    </button>
                    <button
                        type="button"
                        onClick={onOpenSavedVersion}
                        className="min-h-11 cursor-pointer rounded-lg bg-[#F1C6BA] px-3 text-xs font-medium text-[#211713] transition-colors hover:bg-[#F8DDD6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1C6BA]"
                    >
                        Discard and open saved version
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={isConflict ? () => setIsConfirmingDiscard(true) : onRetry}
                    className="min-h-11 shrink-0 cursor-pointer rounded-lg border border-[#8D5A4E] px-3 text-xs font-medium text-[#F8DDD6] transition-colors hover:bg-[#3A241F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1C6BA]"
                >
                    {isConflict ? "View saved version" : "Retry save"}
                </button>
            )}
        </aside>
    );
}
