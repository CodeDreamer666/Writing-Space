"use client"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapMenuBar from "../components/Tiptap/TiptapMenuBar";
import Loading from "../components/Loading";
import ServerError from "../components/ServerError";

const DEFAULT_TITLE = "New Draft";

type Message = {
    role: "assistant" | "user";
    content: string;
};

function countWords(text: string): number {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function readingTime(words: number): string {
    const mins = Math.ceil(words / 200);
    return mins === 1 ? "~1 min read" : `~${mins} min read`;
}

export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const utils = api.useUtils();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [instruction, setInstruction] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "What would you like help with? I can improve your writing, suggest ideas, or help you work through a section." }
    ]);
    const [title, setTitle] = useState("");
    const [wordCount, setWordCount] = useState(0);

    const {
        data: doc,
        isLoading,
        error
    } = api.docs.getSelectedDoc.useQuery(
        { docId: params.docId },
    );

    const askAi = api.ai.askAi.useMutation({
        onSuccess: (data) => {
            if (!data) return;
            setMessages(prev => [...prev, { role: "assistant", content: data }]);
        },
        onError: () => {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Something went wrong. Please try again."
            }]);
        }
    });

    const saveDoc = api.docs.saveDoc.useMutation({
        onSuccess: async () => {
            await utils.invalidate();
        }
    });

    const editor = useEditor({
        extensions: [StarterKit],
        content: (doc?.content as JSONContent) ?? "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "outline-none text-lg leading-[1.85] text-[#C8CBD0] focus:text-[#E0E3E8] transition-colors duration-200",
            },
        },
    });

    useEffect(() => {
        if (!doc) return;
        setTitle(doc.title)
    }, [doc])

    useEffect(() => {
        if (!doc || !editor) return;
        editor.commands.setContent(doc.content as JSONContent);
        setWordCount(countWords(editor.getText()));
    }, [doc, editor]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!doc || !editor) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                saveDoc.mutate({
                    docId: params.docId,
                    title: title?.trim() || DEFAULT_TITLE,
                    content: editor.getJSON(),
                })
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [title, editor]);

    const handleSendAi = () => {
        if (!instruction.trim()) return;
        const userMessage = instruction.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setInstruction("");
        askAi.mutate({ instruction: userMessage, fullDocument: editor?.getText() ?? "" });
    };

    if (!editor) return null;
    if (isLoading) return <Loading />;
    if (error || !doc) return <ServerError />;

    return (
        <div className="mx-auto flex h-screen w-full max-w-3xl flex-col overflow-hidden">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1E2530] px-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F5F5F7] text-xs font-semibold text-[#0B0D10] transition-opacity hover:opacity-80"
                    >
                        W
                    </Link>

                    <input
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}

                        placeholder={DEFAULT_TITLE}
                        className="w-48 bg-transparent text-sm font-medium text-[#C8CBD0] outline-none transition-colors placeholder:text-[#6B7280] hover:text-[#E5E7EA] focus:text-[#F5F5F7]"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => saveDoc.mutate({
                            docId: params.docId,
                            title: title?.trim() || DEFAULT_TITLE,
                            content: editor.getJSON(),
                        })}
                        disabled={saveDoc.isPending}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#1E2530] bg-[#0F1318] px-3 py-1.5 text-xs font-medium text-[#8E96A3] transition-colors hover:text-[#F5F5F7] disabled:cursor-default disabled:opacity-60"
                    >
                        {saveDoc.isPending ? (
                            <>
                                <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                                Saved
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsAiOpen(o => !o)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isAiOpen
                            ? "border-[#2E3643] bg-[#161B22] text-[#F5F5F7]"
                            : "border-[#1E2530] bg-[#0F1318] text-[#8E96A3] hover:text-[#F5F5F7]"
                            }`}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                            <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                        </svg>
                        AI
                    </button>
                </div>
            </header>

            <div className="shrink-0 border-b border-[#1E2530]">
                <TiptapMenuBar editor={editor} />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-2xl">
                        <EditorContent editor={editor} />
                    </div>
                </main>

                <aside className={`fixed right-0 top-0 h-full w-80 flex flex-col 
    border-l border-[#1E2530] bg-[#0B0D10] z-50
    transition-transform duration-300 ease-out
    ${isAiOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#1E2530] px-4">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-[#6B7280]">
                            AI assistant
                        </span>
                        <button
                            onClick={() => setIsAiOpen(false)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#8E96A3] transition-colors hover:bg-[#161B22] hover:text-[#F5F5F7]"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-[13px] leading-[1.6] ${msg.role === "user"
                                        ? "bg-[#1E2530] text-[#E5E7EA] border border-[#2E3643]"
                                        : "bg-[#161B22] text-[#C8CBD0] border border-[#262C36]"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {askAi.isPending && (
                            <div className="flex justify-start">
                                <div className="rounded-xl bg-[#161B22] border border-[#262C36] px-3.5 py-2.5">
                                    <div className="flex gap-1 items-center h-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="shrink-0 border-t border-[#1E2530] p-3">
                        <div className="rounded-xl border border-[#262C36] bg-[#161B22] px-3 py-2.5">
                            <textarea
                                placeholder="Ask anything about your draft…"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendAi();
                                    }
                                }}
                                rows={3}
                                className="w-full resize-none bg-transparent text-[13px] text-[#E5E7EA] outline-none placeholder:text-[#6B7280] leading-relaxed"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[11px] text-[#6B7280]">↵ to send</span>
                                <button
                                    onClick={handleSendAi}
                                    disabled={askAi.isPending || !instruction.trim()}
                                    className="cursor-pointer rounded-lg bg-[#F5F5F7] px-3 py-1.5 text-xs font-medium text-[#0B0D10] transition-opacity hover:opacity-80 disabled:opacity-30"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="flex shrink-0 items-center gap-4 border-t border-[#1E2530] px-12 h-8">
                <span className="text-[11px] text-[#6B7280]">{wordCount.toLocaleString()} words</span>
                <span className="text-[11px] text-[#3A4250]">·</span>
                <span className="text-[11px] text-[#6B7280]">{readingTime(wordCount)}</span>
            </div>

            {isAiOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsAiOpen(false)}
                />
            )}
        </div>
    );
}

