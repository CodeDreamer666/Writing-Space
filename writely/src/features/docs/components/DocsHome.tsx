"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { SignInLegalNotice } from "~/components/layout/LegalLinks";
import Loading from "~/components/shared/Loading";
import LoadingIcon from "~/components/shared/LoadingIcon";
import ServerError from "~/components/shared/ServerError";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import { clearLocalDraft } from "~/features/editor/utils/localDraft";

const CREATE_AFTER_AUTH_KEY = "writely:create-after-auth";

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
  const { showMessage } = useStatusMessage();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const createRequestRef = useRef(false);
  const signInRequestRef = useRef(false);
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const isAuthenticated = Boolean(session?.user);

  const {
    data: docs,
    isLoading,
    error,
  } = api.docs.getUserDocs.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const createDoc = api.docs.createDoc.useMutation({
    onSuccess: (newDocument) => {
      router.push(`/app/${newDocument.id}`);
    },
    onError: (mutationError) => {
      handleTRPCError({
        error: mutationError,
        router,
      });
    },
    onSettled: async () => {
      createRequestRef.current = false;
      await utils.docs.getUserDocs.invalidate();
    },
  });
  const mutateCreateDoc = createDoc.mutate;

  const createDocument = useCallback(() => {
    if (createRequestRef.current) {
      return;
    }

    createRequestRef.current = true;
    mutateCreateDoc();
  }, [mutateCreateDoc]);

  useEffect(() => {
    if (isSessionLoading) {
      return;
    }

    if (!isAuthenticated) {
      window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
      return;
    }

    if (window.sessionStorage.getItem(CREATE_AFTER_AUTH_KEY) !== "true") {
      return;
    }

    window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
    createDocument();
  }, [createDocument, isAuthenticated, isSessionLoading]);

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

  const startGoogleSignIn = async (createDraftAfterSignIn: boolean) => {
    if (signInRequestRef.current) {
      return;
    }

    signInRequestRef.current = true;
    setIsSigningIn(true);

    if (createDraftAfterSignIn) {
      window.sessionStorage.setItem(CREATE_AFTER_AUTH_KEY, "true");
    }

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
        errorCallbackURL: "/app",
      });

      if (result.error) {
        signInRequestRef.current = false;
        window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
        setIsSigningIn(false);
        showMessage(
          "We couldn't start Google sign-in. Please try again.",
          false,
        );
      }
    } catch {
      signInRequestRef.current = false;
      window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
      setIsSigningIn(false);
      showMessage("We couldn't start Google sign-in. Please try again.", false);
    }
  };

  const handleStartWriting = async () => {
    if (isAuthenticated) {
      createDocument();
      return;
    }

    await startGoogleSignIn(true);
  };

  const isStartWritingPending =
    isSessionLoading || isSigningIn || createDoc.isPending;

  if (isSessionLoading || (isAuthenticated && isLoading)) {
    return <Loading />;
  }

  if (isAuthenticated && error) {
    return <ServerError />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--w-background)] text-[var(--w-foreground)]">
      <div className="mx-auto max-w-3xl">
        <section className="px-6 pt-8 pb-12 sm:px-8 sm:pt-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--w-subtle)]">
                <span className="text flex h-12 w-12 items-center justify-center rounded-md border border-[var(--w-border)] font-medium text-[var(--w-muted)]">
                  W
                </span>
                <span className="text tracking-[0.12em] uppercase">
                  Writely
                </span>
              </div>

              <Link
                href="/setting"
                className="rounded-lg px-3 py-2 text-sm text-[var(--w-muted)] transition-colors hover:bg-[var(--w-border-soft)] hover:text-[var(--w-foreground)]"
              >
                Settings
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="max-w-full text-[clamp(2.25rem,12vw,3rem)] leading-[1.12] font-medium tracking-[-0.02em] text-[var(--w-foreground)] sm:text-5xl">
              What will you write today
              <span
                aria-hidden="true"
                className="animate-blink ml-1 inline-block h-[0.9em] w-0.5 translate-y-px rounded-[1px] bg-[var(--w-foreground)] align-middle motion-reduce:animate-none"
              />
            </h1>

            <button
              type="button"
              disabled={isStartWritingPending}
              onClick={() => {
                void handleStartWriting();
              }}
              className="min-h-12 cursor-pointer rounded-xl bg-[var(--w-foreground)] px-6 text-sm font-medium text-[var(--w-background)] transition-all duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--w-foreground)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
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

          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--w-muted)]">
            A quiet space to think, write, and continue.
          </p>
          {!isAuthenticated && <SignInLegalNotice />}
        </section>

        {isAuthenticated && (
          <>
            <div className="mx-6 h-px bg-[var(--w-border-soft)] sm:mx-8" />

            <section
              className="px-6 pt-9 pb-10 sm:px-8"
              aria-labelledby="recent-drafts"
            >
              <h2
                id="recent-drafts"
                className="mb-5 text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase"
              >
                Recent documents
              </h2>

              {!docs || docs.length === 0 ? (
                <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--w-border-soft)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--w-border-soft)_32%,transparent),transparent_52%)] px-5 py-11 text-center sm:py-12">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--w-border-soft)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:14px_14px] opacity-70"
                  />

                  <div className="relative mx-auto flex flex-col items-center">
                    <div className="flex justify-center gap-4">
                      <div className="relative flex size-16 items-center justify-center rounded-2xl border border-[var(--w-border)] bg-[var(--w-background)] text-[var(--w-muted)] shadow-[0_12px_30px_color-mix(in_srgb,var(--w-background)_30%,transparent)]">
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
                        <p className="text-base font-medium text-[var(--w-foreground)]">
                          Your writing space is ready
                        </p>
                        <p className="text-sm leading-relaxed text-[var(--w-subtle)]">
                          Create your first draft and begin with a blank page.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isStartWritingPending}
                      onClick={() => {
                        void handleStartWriting();
                      }}
                      className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-[var(--w-foreground)] px-4 text-sm font-medium text-[var(--w-background)] transition-all duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--w-foreground)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
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
                      className="group flex items-center rounded-xl hover:bg-[var(--w-surface-raised)]"
                    >
                      <Link
                        href={`/app/${id}`}
                        className="min-w-0 flex-1 rounded-xl px-3 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
                      >
                        <p className="truncate text-sm font-medium text-[var(--w-strong)]">
                          {title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--w-subtle)]">
                          {formatRelativeTime(updatedAt)}
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDocumentToDelete({ id, title })}
                        aria-label={`Delete ${title}`}
                        className="mr-2 flex size-11 cursor-pointer items-center justify-center rounded-lg text-[var(--w-muted)] hover:bg-[var(--w-border-soft)] hover:text-[var(--w-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
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
          onKeyDown={(event) => {
            if (event.key === "Escape" && !deleteDoc.isPending) {
              setDocumentToDelete(null);
            }
          }}
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
            className="relative w-full max-w-sm rounded-2xl border border-[#4B2E2A] bg-[var(--w-surface)] p-6"
          >
            <h2
              id="delete-document-title"
              className="text-base font-medium text-[var(--w-foreground)]"
            >
              Delete &quot;{documentToDelete.title}&quot;?
            </h2>
            <p
              id="delete-document-description"
              className="mt-2 text-sm leading-6 text-[var(--w-muted)]"
            >
              This permanently removes the draft from every signed-in device.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                autoFocus
                disabled={deleteDoc.isPending}
                onClick={() => setDocumentToDelete(null)}
                className="min-h-11 w-full cursor-pointer rounded-xl text-sm text-[var(--w-muted)] hover:bg-[var(--w-border-soft)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteDoc.isPending}
                onClick={() => deleteDoc.mutate({ docId: documentToDelete.id })}
                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D85E50] text-sm font-medium text-white hover:bg-[#EA6C5E] disabled:cursor-wait disabled:opacity-60"
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
