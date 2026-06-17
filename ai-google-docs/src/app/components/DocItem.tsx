"use client"
import { useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";

function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins === 0) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
        return then.toLocaleDateString("en-US", { weekday: "long" });
    }
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DocItem({
    id,
    title,
    wordCount,
    updatedAt,
}: {
    id: string;
    title: string;
    wordCount?: number | null;
    updatedAt?: Date | string | null;
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameInput, setRenameInput] = useState(title);
    const utils = api.useUtils();

    const deleteDoc = api.docs.deleteDoc.useMutation({
        onMutate: async (newData) => {
            await utils.docs.getUserDocs.cancel();
            const previousInfo = utils.docs.getUserDocs.getData();
            utils.docs.getUserDocs.setData(undefined, (old) => {
                if (!old) return old;
                return old.filter(doc => doc.id !== newData.docId);
            });
            return { previousInfo };
        },
        onSettled: async () => {
            await utils.invalidate();
        }
    });

    const renameDocTitle = api.docs.renameDocTitle.useMutation({
        onMutate: async (newData) => {
            await utils.docs.getUserDocs.cancel();
            const previousInfo = utils.docs.getUserDocs.getData();
            utils.docs.getUserDocs.setData(undefined, (old) => {
                if (!old) return old;
                return old.map((doc) =>
                    doc.id === newData.docId ? { ...doc, title: newData.title } : doc
                );
            });
            return { previousInfo };
        },
        onSettled: async () => {
            await utils.invalidate();
        }
    });

    return (
        <>
            <li className="relative">
                <Link
                    href={`/${id}`}
                    className="group flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-[#161B22]"
                >
                    <svg
                        className="h-9 w-8 shrink-0"
                        viewBox="0 0 32 38"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect x="0" y="0" width="32" height="38" rx="4" fill="#262C36" />
                        <path d="M22 0 L32 10 L22 10 Z" fill="#343C49" />
                        <line x1="7" y1="17" x2="25" y2="17" stroke="#4A5363" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="7" y1="22" x2="25" y2="22" stroke="#4A5363" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="7" y1="27" x2="19" y2="27" stroke="#4A5363" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#E5E7EA]">
                            {title}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                            {wordCount != null ? `${wordCount.toLocaleString()} words` : ""}
                            {wordCount != null && updatedAt ? " · " : ""}
                            {updatedAt ? formatRelativeTime(updatedAt) : ""}
                        </p>
                    </div>

                    {/* More button — visible on hover */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDropdownOpen(prev => !prev);
                        }}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#8E96A3] opacity-0 transition-all hover:bg-[#262C36] hover:text-[#F5F5F7] group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label="Options"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                </Link>

                {isDropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-2 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#262C36] bg-[#12161C] shadow-2xl">
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    setIsRenameModalOpen(true);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#C8CBD0] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7]"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                    <path d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                                Rename
                            </button>
                            <div className="h-px bg-[#262C36]" />
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    deleteDoc.mutate({ docId: id });
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#C8CBD0] transition-colors hover:bg-[#1E2530] hover:text-[#FF6B5E]"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </li>

            {isRenameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-[#262C36] bg-[#12161C] p-7">
                        <h2 className="mb-4 text-base font-medium text-[#F5F5F7]">
                            Rename draft
                        </h2>
                        <input
                            autoFocus
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setIsRenameModalOpen(false);
                                    renameDocTitle.mutate({ docId: id, title: renameInput });
                                }
                                if (e.key === "Escape") setIsRenameModalOpen(false);
                            }}
                            placeholder="Untitled draft"
                            className="w-full rounded-xl border border-[#2E3643] bg-[#0B0D10] px-4 py-3 text-sm text-[#F5F5F7] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#555C6A]"
                        />
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setIsRenameModalOpen(false)}
                                className="w-full cursor-pointer rounded-xl py-3 text-sm text-[#8E96A3] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsRenameModalOpen(false);
                                    renameDocTitle.mutate({ docId: id, title: renameInput });
                                }}
                                className="w-full cursor-pointer rounded-xl bg-[#F5F5F7] py-3 text-sm font-medium text-[#0B0D10] transition-opacity hover:opacity-80"
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}