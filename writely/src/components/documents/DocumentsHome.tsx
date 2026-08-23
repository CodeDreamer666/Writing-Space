"use client";
import Link from "next/link";
import formatRelativeTime from "~/lib/formatRelativeTime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "~/components/shared/Loading";
import LoadingIcon from "~/components/shared/LoadingIcon";
import ServerError from "~/components/shared/ServerError";
import clearPendingDraft from "~/features/documents/clearPendingDraft";
import clearLocalDraft from "~/features/editor/utils/localDraft/clearLocalDraft";
import useHandleTRPCError from "~/trpc/useHandleTRPCError";
import authClient from "~/server/better-auth/client";
import api from "~/trpc/api";

export default function DocumentsHome() {
    const router = useRouter();
    const utils = api.useUtils();
    const handleTRPCError = useHandleTRPCError();
    const [documentToDelete, setDocumentToDelete] = useState<{
        id: string;
        title: string;
    } | null>(null);

    const { data: session, isPending: isSessionLoading } =
        authClient.useSession();
    const { data: docs, isLoading, error } = api.docs.getUserDocs.useQuery();

    const createDoc = api.docs.createDoc.useMutation({
        onSuccess: (newDocument) => {
            clearPendingDraft();
            router.push(`/app/${newDocument.id}`);
        },

        onError: (mutationError) =>
            handleTRPCError({ error: mutationError, router }),
        onSettled: async () => utils.docs.getUserDocs.invalidate(),
    });

    const deleteDoc = api.docs.deleteDoc.useMutation({
        onMutate: async ({ docId }) => {
            await utils.docs.getUserDocs.cancel();
            const previousDocuments = utils.docs.getUserDocs.getData();
            utils.docs.getUserDocs.setData(undefined, (current) =>
                current?.filter((document) => document.id !== docId),
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
        onSettled: async () => utils.docs.getUserDocs.invalidate(),
    });

    const startWriting = async () => {
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

    if (isSessionLoading || (session?.user && isLoading)) return <Loading />;
    if (session?.user && error) return <ServerError />;

    const isPending = isSessionLoading || createDoc.isPending;

    return (
        <main className="min-h-screen bg-(--w-background) text-(--w-foreground)">
            <header className="flex items-center justify-between border-b border-(--w-border-soft) px-5 py-5 sm:px-10 sm:py-6">
                <Link href="/" className="flex items-center gap-3.5">
                    <span className="font-display flex size-[34px] items-center justify-center border border-(--w-foreground) text-[17px]">
                        W
                    </span>
                    <span className="font-mono-label text-xs tracking-[0.3em] uppercase">
                        Writely
                    </span>
                </Link>
                <Link
                    href="/setting"
                    className="font-mono-label border-b border-(--w-border) py-1 text-[11px] tracking-[0.18em] uppercase hover:border-(--w-foreground)"
                >
                    Settings
                </Link>
            </header>

            <div className="mx-auto max-w-[1080px] px-5">
                <section className="grid items-end gap-8 border-b border-(--w-border-soft) py-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:pt-8 md:pb-10">
                    <div>
                        <p className="font-mono-label mb-7 text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase">
                            Your desk
                        </p>
                        <h1 className="font-display text-[clamp(2.6rem,5.6vw,4.5rem)] leading-[1.02] font-light tracking-[-0.03em]">
                            What will you write today
                            <span
                                aria-hidden="true"
                                className="animate-blink ml-2 inline-block h-[0.82em] w-[3px] bg-current align-baseline"
                            />
                        </h1>
                        <p className="mt-6 max-w-[34ch] text-base leading-[1.7] text-(--w-muted)">
                            A quiet space to think, write, and continue.
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => void startWriting()}
                        className="h-14 w-full cursor-pointer bg-(--w-foreground) px-[34px] text-[15px] font-medium whitespace-nowrap text-(--w-background) hover:opacity-80 disabled:cursor-wait disabled:opacity-60 md:w-auto"
                    >
                        {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <LoadingIcon />
                                Creating...
                            </span>
                        ) : (
                            "Start writing"
                        )}
                    </button>
                </section>

                {session?.user && (
                    <section
                        className="pt-12 pb-[120px]"
                        aria-labelledby="recent-documents"
                    >
                        <div className="mb-2 flex items-baseline justify-between">
                            <h2
                                id="recent-documents"
                                className="font-mono-label text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase"
                            >
                                Recent documents
                            </h2>
                            <p className="font-mono-label text-[11px] tracking-[0.14em]">
                                {docs?.length === 1 ? "1 draft" : `${docs?.length ?? 0} drafts`}
                            </p>
                        </div>
                        {!docs?.length ? (
                            <div className="border border-(--w-foreground) px-5 py-14 text-center sm:px-10 sm:py-[72px]">
                                <h3 className="font-display text-2xl">The page is waiting</h3>
                                <p className="mt-3 text-sm leading-[1.7] text-(--w-muted)">
                                    Create your first draft and begin with a blank page.
                                </p>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => void startWriting()}
                                    className="mt-7 h-12 cursor-pointer bg-(--w-foreground) px-6 text-sm font-medium text-(--w-background) disabled:cursor-wait disabled:opacity-60"
                                >
                                    Write your first line
                                </button>
                            </div>
                        ) : (
                            <ol className="border-t border-(--w-foreground)">
                                {docs.map(({ id, title, updatedAt }, index) => (
                                    <li
                                        key={id}
                                        className="group grid grid-cols-[34px_minmax(0,1fr)_auto_44px] items-center gap-3 border-b border-(--w-border-soft) hover:bg-(--w-surface-raised) sm:grid-cols-[48px_minmax(0,1fr)_auto_56px] sm:gap-5"
                                    >
                                        <span className="font-mono-label text-[11px]">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <Link
                                            href={`/app/${id}`}
                                            className="font-display min-w-0 truncate py-6 text-lg sm:text-[21px]"
                                        >
                                            {title}
                                        </Link>
                                        <span className="font-mono-label text-[10px] tracking-[0.06em] whitespace-nowrap text-(--w-subtle) sm:text-[11px] sm:tracking-[0.1em]">
                                            {formatRelativeTime(updatedAt)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setDocumentToDelete({ id, title })}
                                            aria-label={`Delete ${title}`}
                                            className="font-mono-label h-full min-h-14 cursor-pointer border-l border-(--w-border-soft) bg-transparent text-sm hover:bg-(--w-foreground) hover:text-(--w-background)"
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                )}
            </div>

            {documentToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
                    <button
                        type="button"
                        aria-label="Cancel document deletion"
                        disabled={deleteDoc.isPending}
                        onClick={() => setDocumentToDelete(null)}
                        className="absolute inset-0 cursor-default"
                    />
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-document-title"
                        className="relative w-full max-w-[420px] border border-(--w-foreground) bg-(--w-background) p-6 sm:p-7"
                    >
                        <p className="font-mono-label text-[10px] tracking-[0.2em] text-(--w-subtle) uppercase">
                            Permanent action
                        </p>
                        <h2
                            id="delete-document-title"
                            className="font-display mt-3 text-2xl"
                        >
                            Delete “{documentToDelete.title}”?
                        </h2>
                        <p className="mt-3 text-sm leading-[1.7] text-(--w-muted)">
                            This permanently removes the draft from every signed-in device.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                autoFocus
                                disabled={deleteDoc.isPending}
                                onClick={() => setDocumentToDelete(null)}
                                className="h-11 flex-1 cursor-pointer border border-(--w-border) bg-transparent text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteDoc.isPending}
                                onClick={() => deleteDoc.mutate({ docId: documentToDelete.id })}
                                className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 bg-(--w-foreground) text-sm font-medium text-(--w-background) disabled:cursor-wait disabled:opacity-60"
                            >
                                {deleteDoc.isPending && <LoadingIcon />}
                                {deleteDoc.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
