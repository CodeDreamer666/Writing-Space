"use client"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapMenuBar from "../components/Tiptap/TiptapMenuBar";
import Loading from "../components/Loading";
import ServerError from "../components/ServerError";

const DEFAULT_TITLE = "New Draft";

export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const utils = api.useUtils();

    const {
        data: doc,
        isLoading,
        error
    } = api.docs.getSelectedDoc.useQuery({ docId: params.docId });

    const [isAiOpen, setIsAiOpen] = useState(false);
    const [instruction, setInstruction] = useState("");
    const [title, setTitle] = useState(doc?.title);
    const [debouncedTitle, setDebouncedTitle] = useState(doc?.title);

    const askAi = api.ai.askAi.useMutation({
        onSuccess: (newData) => {
            console.log(newData)
        }
    });

    const saveTitle = api.docs.saveDocTitle.useMutation({
        onSettled: async () => {
            await utils.invalidate();
        }
    })

    const editor = useEditor({
        extensions: [StarterKit],
        content: "<textarea></textarea>",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `min-h-[70vh] outline-none text-lg leading-9`,
            },
        },
    });

    useEffect(() => {
        if (!doc) return;

        setTitle(doc.title);
    }, [doc]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTitle(title);
        }, 1000);

        return () => clearTimeout(timer);
    }, [title]);

    useEffect(() => {
        if (!doc) return;

        const finalTitle =
            debouncedTitle?.trim() === ""
                ? DEFAULT_TITLE
                : debouncedTitle?.trim() ?? DEFAULT_TITLE

        if (finalTitle === doc.title) return;

        saveTitle.mutate({
            docId: params.docId,
            title: finalTitle,
        });
    }, [debouncedTitle]);

    if (!editor) return null;

    if (isLoading) return <Loading />

    if (error || !doc) return <ServerError />

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
                                value={title || ""}
                                onChange={(event) => setTitle(event.target.value)}
                                onBlur={() => {
                                    const finalTitle =
                                        title?.trim() === ""
                                            ? DEFAULT_TITLE
                                            : title?.trim() ?? DEFAULT_TITLE;

                                    setTitle(finalTitle);

                                    saveTitle.mutate({
                                        docId: params.docId,
                                        title: finalTitle,
                                    });
                                }}
                                className="bg-transparent text-sm font-medium outline-none placeholder:text-[#8E96A3]"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-[#69707C]">
                                {saveTitle.isPending ? "Saving..." : "Saved"}
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
                        <TiptapMenuBar editor={editor} />
                        <div className="h-px bg-[#1A1F26]" />
                        <EditorContent
                            editor={editor}
                            className="py-2"
                        />
                    </main>

                </div>
            </div>

            {isAiOpen && (
                <div
                    className="fixed inset-0 bg-black/40"
                    onClick={() => setIsAiOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 bg-black right-0 h-full w-[70%]
                                transform transition-transform duration-500 ease-out
                                ${isAiOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex h-16 items-center justify-between px-6">
                    <h2 className="text-sm font-medium">
                        AI Assistant
                    </h2>

                    <button
                        onClick={() => setIsAiOpen(false)}
                        className="h-8 w-8 cursor-pointer font-semibold hover:bg-gray-800 transition-all duration-300 rounded-full"
                    >
                        X
                    </button>
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
                                value={instruction}
                                onChange={(event) => setInstruction(event.target.value)}
                                className="min-h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-[#69707C]"
                            />

                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => askAi.mutate({
                                        instruction,
                                        fullDocument: editor.getText(),
                                    })}
                                    className="cursor-pointer rounded-xl bg-[#F5F5F7] px-4 py-2 text-sm font-medium text-[#0B0D10]"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    )
}

