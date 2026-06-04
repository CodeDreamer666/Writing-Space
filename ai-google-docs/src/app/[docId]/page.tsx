"use client"
import { useParams } from "next/navigation";
import Link from "next/link";
import Tiptap from "~/components/Tiptap"
import { useState } from "react";

export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const [isAiOpen, setIsAiOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-[#0B0D10] text-[#F5F5F7]">
            <div className="flex-1">
                <div className="mx-auto px-6">
                    <header className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F7] text-sm font-semibold text-[#0B0D10]"
                            >
                                W
                            </Link>

                            <input
                                placeholder="New Draft"
                                className="bg-transparent text-sm font-medium outline-none placeholder:text-[#8E96A3]"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-[#69707C]">
                                Saved
                            </span>

                            <button
                                onClick={() => setIsAiOpen(!isAiOpen)}
                                className="cursor-pointer rounded-xl px-3 py-1.5 text-sm text-[#8E96A3] transition-colors hover:bg-[#12161C] hover:text-[#F5F5F7]"
                            >
                                AI
                            </button>
                        </div>
                    </header>

                    <div className="h-px bg-[#1A1F26]" />

                    <main className="mx-auto w-full">
                        <Tiptap />
                    </main>

                </div>
            </div>

            {isAiOpen && (
                <div
                    className="fixed inset-0 bg-black/40"
                    onClick={() => setIsAiOpen(false)}
                />
            )}

            {isAiOpen && (
                <aside
                    className={`fixed top-0 bg-black right-0 h-full w-[70%]
                                transform transition-transform duration-500 ease-out
                                `}
                >
                    <div className="flex h-16 items-center px-6">
                        <h2 className="text-sm font-medium">
                            AI Assistant
                        </h2>
                    </div>

                    <div className="h-px bg-[#1A1F26]" />

                    <div className="flex h-[calc(100vh-65px)] flex-col">
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="mb-6">
                                <div
                                    className="inline-block rounded-2xl bg-[#12161C] px-4 py-3 text-sm text-[#D0D5DD]"
                                >
                                    What would you like me to help with?
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#1A1F26] p-4">
                            <div
                                className="rounded-2xl border border-[#252B36] bg-[#12161C] p-3"
                            >
                                <textarea
                                    placeholder="Ask AI..."
                                    className="min-h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-[#69707C]"
                                />

                                <div className="mt-3 flex justify-end">
                                    <button
                                        className="cursor-pointer rounded-xl bg-[#F5F5F7] px-4 py-2 text-sm font-medium text-[#0B0D10]"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    )
}

