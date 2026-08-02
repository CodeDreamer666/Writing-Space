"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Loading from "~/components/shared/Loading";
import LoadingIcon from "~/components/shared/LoadingIcon";
import ServerError from "~/components/shared/ServerError";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import { clearLocalDraft } from "~/features/editor/utils/localDraft";
import {
    clearPendingDraft,
} from "~/features/docs/utils/pendingDraft";

function formatRelativeTime(date: Date | string) {
    const now = new Date();
    const then = new Date(date);
    const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);

    if (minutes <= 0) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    if (hours < 48) {
        return "Yesterday";
    }

    return then.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: then.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

export default function DocsHome() {
    const router = useRouter();
    const utils = api.useUtils();
    const handleTRPCError = useHandleTRPCError();

    const [documentToDelete, setDocumentToDelete] = useState<{
        id: string;
        title: string;
    } | null>(null);

    const { data: session, isPending: isSessionLoading } = authClient.useSession();

    const {
        data: docs,
        isLoading,
        error,
    } = api.docs.getUserDocs.useQuery();

    const createDoc = api.docs.createDoc.useMutation({
        onSuccess: (newDocument) => {
            clearPendingDraft();
            router.push(`/app/${newDocument.id}`);
        },

        onError: (mutationError) => {
            handleTRPCError({
                error: mutationError,
                router,
            });
        },

        onSettled: async () => {
            await utils.docs.getUserDocs.invalidate();
        },
    });

    const deleteDoc = api.docs.deleteDoc.useMutation({
        onMutate: async ({ docId }) => {
            await utils.docs.getUserDocs.cancel();

            const previousDocuments = utils.docs.getUserDocs.getData();

            utils.docs.getUserDocs.setData(undefined, (currentDocuments) =>
                currentDocuments?.filter((document) => document.id !== docId),
            );

            return { previousDocuments };
        },

        onSuccess: (_result, { docId }) => {
            clearLocalDraft(docId);
            setDocumentToDelete(null);
        },

        onError: (mutationError, _input, context) => {
            utils.docs.getUserDocs.setData(undefined, context?.previousDocuments);

            handleTRPCError({ error: mutationError, router });
        },

        onSettled: async () => {
            await utils.docs.getUserDocs.invalidate();
        },
    });

    const handleStartWriting = async () => {
        if (session?.user) {
            createDoc.mutate();
            return;
        }

        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/app",
            errorCallbackURL: "/app",
        });
    };

    const isStartWritingPending = isSessionLoading || createDoc.isPending;

    if (isSessionLoading || (session?.user && isLoading)) {
        return <Loading />;
    }

    if (session?.user && error) {
        return <ServerError />;
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-(--w-background) text-(--w-foreground)">
            <div className="mx-auto max-w-3xl">
                <section className="px-6 pt-8 pb-12 sm:px-8 sm:pt-12">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2 text-(--w-subtle)">
                                <span className="text flex h-12 w-12 items-center justify-center rounded-md border border-(--w-border) font-medium text-(--w-muted)">
                                    W
                                </span>
                                <span className="text tracking-[0.12em] uppercase">
                                    Writely
                                </span>
                            </div>

                            <Link
                                href="/setting"
                                className="rounded-lg px-3 py-2 text-sm text-(--w-muted) transition-colors hover:text-(--w-foreground)"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>

                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <h1 className="max-w-full text-[clamp(2.25rem,12vw,3rem)] leading-[1.12] font-medium tracking-[-0.02em] text-(--w-foreground) sm:text-5xl">
                            What will you write today
                            <span
                                aria-hidden="true"
                                className="animate-blink ml-1 inline-block h-[0.9em] w-0.5 translate-y-px rounded-[1px] bg-(--w-foreground) align-middle motion-reduce:animate-none"
                            />
                        </h1>

                        <button
                            type="button"
                            disabled={isStartWritingPending}
                            onClick={async () => {
                                await handleStartWriting();
                            }}
                            className={[
                                "min-h-12 hidden md:block cursor-pointer rounded-xl bg-(--w-foreground)",
                                "px-6 text-sm font-medium text-(--w-background)",
                                "transition-all duration-200 hover:opacity-85 focus-visible:outline-2",
                                "focus-visible:outline-offset-4 focus-visible:outline-(--w-foreground) active:scale-[0.98] disabled:cursor-wait",
                                "disabled:opacity-60",
                            ].join(" ")}
                        >
                            {isStartWritingPending ? (
                                <span className="flex items-center gap-2">
                                    <LoadingIcon />
                                    <span>Creating...</span>
                                </span>
                            ) : (
                                "Start writing"
                            )}
                        </button>
                    </div>

                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-(--w-muted)">
                        A quiet space to think, write, and continue.
                    </p>

                    <button
                        type="button"
                        disabled={isStartWritingPending}
                        onClick={async () => {
                            await handleStartWriting();
                        }}
                        className={[
                            "min-h-12 block md:hidden w-full mt-6 cursor-pointer rounded-xl bg-(--w-foreground)",
                            "px-6 text-sm font-medium text-(--w-background)",
                            "transition-all duration-200 hover:opacity-85 focus-visible:outline-2",
                            "focus-visible:outline-offset-4 focus-visible:outline-(--w-foreground) active:scale-[0.98] disabled:cursor-wait",
                            "disabled:opacity-60",
                        ].join(" ")}
                    >
                        {isStartWritingPending ? (
                            <span className="flex items-center gap-2">
                                <LoadingIcon />
                                <span>Creating...</span>
                            </span>
                        ) : (
                            "Start writing"
                        )}
                    </button>
                </section>

                {session?.user && (
                    <>
                        <div className="mx-6 h-px bg-(--w-border-soft) sm:mx-8" />

                        <section
                            className="px-6 pt-9 pb-10 sm:px-8"
                            aria-labelledby="recent-drafts"
                        >
                            <h2
                                id="recent-drafts"
                                className="mb-5 text-[11px] font-medium tracking-widest text-(--w-subtle) uppercase"
                            >
                                Recent documents
                            </h2>

                            {!docs || docs.length === 0 ? (
                                <div
                                    className={[
                                        "relative overflow-hidden rounded-xl border",
                                        "border-dashed border-(--w-border-soft) bg-[linear-gradient(135deg,color-mix(in_srgb,var(--w-border-soft)_32%,transparent),transparent_52%)] px-5",
                                        "py-11 text-center sm:py-12",
                                    ].join(" ")}
                                >
                                    <div
                                        aria-hidden="true"
                                        className={[
                                            "pointer-events-none absolute inset-0 bg-[radial-gradient(var(--w-border-soft)_1px,transparent_1px)]",
                                            "mask-[linear-gradient(to_bottom,black,transparent)] bg-size-[14px_14px] opacity-70",
                                        ].join(" ")}
                                    />

                                    <div className="relative mx-auto flex flex-col items-center">
                                        <div className="flex justify-center gap-4">
                                            <div
                                                className={[
                                                    "relative flex size-16 items-center",
                                                    "justify-center rounded-2xl border border-(--w-border)",
                                                    "bg-(--w-background) text-(--w-muted) shadow-[0_12px_30px_color-mix(in_srgb,var(--w-background)_30%,transparent)]",
                                                ].join(" ")}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                    className="size-8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M14.5 3.75H6.75A1.75 1.75 0 0 0 5 5.5v13A1.75 1.75 0 0 0 6.75 20.25h10.5A1.75 1.75 0 0 0 19 18.5v-9.25L14.5 3.75Z"
                                                    />
                                                    <path strokeLinecap="round" d="M14 3.75V10h5" />
                                                    <path strokeLinecap="round" d="M8.5 14h7M8.5 17h4" />
                                                </svg>
                                            </div>

                                            <div className="flex flex-col justify-center gap-1 text-left">
                                                <p className="text-base font-medium text-(--w-foreground)">
                                                    Your writing space is ready
                                                </p>
                                                <p className="text-sm leading-relaxed text-(--w-subtle)">
                                                    Create your first draft and begin with a blank page.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isStartWritingPending}
                                            onClick={async () => {
                                                await handleStartWriting();
                                            }}
                                            className={[
                                                "mt-4 inline-flex min-h-10 w-full",
                                                "cursor-pointer items-center justify-center rounded-lg",
                                                "bg-(--w-foreground) px-4 text-sm font-medium",
                                                "text-(--w-background) transition-all duration-200 hover:opacity-85",
                                                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--w-foreground) active:scale-[0.98]",
                                                "disabled:cursor-wait disabled:opacity-60",
                                            ].join(" ")}
                                        >
                                            Write your first line
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1">
                                    {docs.map(({ title, id, updatedAt }) => (
                                        <li
                                            key={id}
                                            className="group flex items-center rounded-xl hover:bg-(--w-surface-raised)"
                                        >
                                            <Link
                                                href={`/app/${id}`}
                                                className="min-w-0 flex gap-2 items-center flex-1 rounded-xl px-3 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--w-muted)"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                    className="size-10 opacity-60"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M14.5 3.75H6.75A1.75 1.75 0 0 0 5 5.5v13A1.75 1.75 0 0 0 6.75 20.25h10.5A1.75 1.75 0 0 0 19 18.5v-9.25L14.5 3.75Z"
                                                    />
                                                    <path strokeLinecap="round" d="M14 3.75V10h5" />
                                                    <path strokeLinecap="round" d="M8.5 14h7M8.5 17h4" />
                                                </svg>
                                                <div>
                                                    <p className="flex min-w-0 items-center gap-2 truncate text-sm font-medium text-(--w-strong)">
                                                        <span className="truncate">{title}</span>
                                                    </p>
                                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-(--w-subtle)">
                                                        <span>{formatRelativeTime(updatedAt)}</span>
                                                    </p>
                                                </div>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setDocumentToDelete({ id, title })}
                                                aria-label={`Delete ${title}`}
                                                className={[
                                                    "mr-2 flex size-11 cursor-pointer",
                                                    "items-center justify-center rounded-lg text-(--w-muted)",
                                                    "hover:bg-(--w-border-soft) hover:text-(--w-foreground) focus-visible:outline-2 focus-visible:outline-offset-2",
                                                    "focus-visible:outline-(--w-muted)",
                                                ].join(" ")}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                    className="size-4"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m14.7 9-.35 9m-4.7 0L9.3 9m9.9-3.2L18.2 19.7a2.25 2.25 0 0 1-2.25 2.05H8.05A2.25 2.25 0 0 1 5.8 19.7L4.8 5.8m14.4 0H4.8m3.7 0V4.5A2.25 2.25 0 0 1 10.75 2.25h2.5A2.25 2.25 0 0 1 15.5 4.5v1.3"
                                                    />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>

            {documentToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                >
                    <button
                        type="button"
                        disabled={deleteDoc.isPending}
                        aria-label="Cancel document deletion"
                        onClick={() => setDocumentToDelete(null)}
                        className="absolute inset-0 cursor-default disabled:cursor-wait"
                    />
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-document-title"
                        aria-describedby="delete-document-description"
                        className="relative w-full max-w-sm rounded-2xl border border-[#4B2E2A] bg-(--w-surface) p-6"
                    >
                        <h2
                            id="delete-document-title"
                            className="text-base font-medium text-(--w-foreground)"
                        >
                            Delete &quot;{documentToDelete.title}&quot;?
                        </h2>
                        <p
                            id="delete-document-description"
                            className="mt-2 text-sm leading-6 text-(--w-muted)"
                        >
                            This permanently removes the draft from every signed-in device.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                autoFocus
                                disabled={deleteDoc.isPending}
                                onClick={() => setDocumentToDelete(null)}
                                className="min-h-11 w-full cursor-pointer rounded-xl text-sm text-(--w-muted) hover:bg-(--w-border-soft) disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteDoc.isPending}
                                onClick={() => deleteDoc.mutate({ docId: documentToDelete.id })}
                                className={[
                                    "flex min-h-11 w-full cursor-pointer",
                                    "items-center justify-center gap-2 rounded-xl",
                                    "bg-[#D85E50] text-sm font-medium text-white",
                                    "hover:bg-[#EA6C5E] disabled:cursor-wait disabled:opacity-60",
                                ].join(" ")}
                            >
                                {deleteDoc.isPending && <LoadingIcon />}
                                {deleteDoc.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
