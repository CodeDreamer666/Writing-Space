"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingIcon from "~/components/shared/LoadingIcon";

function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins <= 0) {
        return "Just now";
    }

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    }

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    if (diffDays === 1) {
        return "Yesterday";
    }

    if (diffDays < 7) {
        return then.toLocaleDateString("en-US", { weekday: "long" });
    }

    return then.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: then.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

type DocItemProps = {
    id: string;
    title: string;
    updatedAt: Date | string;
    isDeleting: boolean;
    onDelete: (docId: string) => void;
};

export default function DocItem({
    id,
    title,
    updatedAt,
    isDeleting,
    onDelete,
}: DocItemProps) {
    const deleteDialogRef = useRef<HTMLElement>(null);
    const optionsButtonRef = useRef<HTMLButtonElement>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const closeDialog = useCallback(
        () => {
            setIsDeleteDialogOpen(false);
            queueMicrotask(() => optionsButtonRef.current?.focus());
        },
        [title],
    );

    useEffect(() => {
        const dialog = isDeleteDialogOpen ? deleteDialogRef.current : null
        if (!dialog) {
            return;
        }

        const handleDialogKeys = (event: KeyboardEvent) => {
            if (event.key !== "Tab") {
                return;
            }

            const focusableElements = Array.from(
                dialog.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        dialog.addEventListener("keydown", handleDialogKeys);

        return () => {
            dialog.removeEventListener("keydown", handleDialogKeys);
        };
    }, [
        isDeleteDialogOpen,
        isDeleting,
        closeDialog,
    ]);

    return (
        <>
            <li className="relative">
                <div className="group flex items-center rounded-xl transition-colors focus-within:bg-[#161B22] hover:bg-[#161B22]">
                    <Link
                        href={`/${id}`}
                        className="flex min-w-0 flex-1 items-center gap-3.5 rounded-xl px-3 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
                    >
                        <svg
                            className="h-9 w-8 shrink-0"
                            viewBox="0 0 32 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <rect x="0" y="0" width="32" height="38" rx="4" fill="#262C36" />
                            <path d="M22 0 L32 10 L22 10 Z" fill="#343C49" />
                            <line
                                x1="7"
                                y1="17"
                                x2="25"
                                y2="17"
                                stroke="#4A5363"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <line
                                x1="7"
                                y1="22"
                                x2="25"
                                y2="22"
                                stroke="#4A5363"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <line
                                x1="7"
                                y1="27"
                                x2="19"
                                y2="27"
                                stroke="#4A5363"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#E5E7EA]">
                                {title}
                            </p>
                            <p className="mt-1 text-xs text-[#6B7280]">
                                {formatRelativeTime(updatedAt)}
                            </p>
                        </div>
                    </Link>

                    <button
                        ref={optionsButtonRef}
                        type="button"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#8E96A3] opacity-100 transition-all hover:bg-[#262C36] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                        aria-label={`Options for ${title}`}
                        aria-haspopup="menu"

                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            </li>

            {isDeleteDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
                    onKeyDown={(event) => {
                        if (event.key === "Escape" && !isDeleting) {
                            closeDialog();
                        }
                    }}
                >
                    <section
                        ref={deleteDialogRef}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={`delete-title-${id}`}
                        aria-describedby={`delete-description-${id}`}
                        className="w-full max-w-sm rounded-2xl border border-[#4B2E2A] bg-[#12161C] p-6 sm:p-7"
                    >
                        <h2
                            id={`delete-title-${id}`}
                            className="text-base font-medium text-[#F5F5F7]"
                        >
                            Delete “{title}”?
                        </h2>
                        <p
                            id={`delete-description-${id}`}
                            className="mt-2 text-sm leading-6 text-[#8E96A3]"
                        >
                            This action cannot be undone.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                autoFocus
                                disabled={isDeleting}
                                onClick={() => closeDialog()}
                                className="min-h-11 w-full cursor-pointer rounded-xl text-sm text-[#AEB4BE] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] disabled:cursor-wait disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => onDelete(id)}
                                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D85E50] text-sm font-medium text-white transition-colors hover:bg-[#EA6C5E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A7D] disabled:cursor-wait disabled:opacity-60"
                            >
                                {isDeleting && <LoadingIcon />}
                                <span>{isDeleting ? "Deleting" : "Delete"}</span>
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
