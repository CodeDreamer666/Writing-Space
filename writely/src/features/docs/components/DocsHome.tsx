"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import Loading from "~/components/shared/Loading";
import LoadingIcon from "~/components/shared/LoadingIcon";
import ServerError from "~/components/shared/ServerError";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import DocItem from "./DocItem";

const CREATE_AFTER_AUTH_KEY = "writely:create-after-auth";

export default function DocsHome() {
  const router = useRouter();
  const utils = api.useUtils();
  const handleTRPCError = useHandleTRPCError();
  const { showMessage } = useStatusMessage();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
      router.push(`/${newDocument.id}`);
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
  const createDocument = createDoc.mutate;

  useEffect(() => {
    if (
      !isAuthenticated ||
      window.sessionStorage.getItem(CREATE_AFTER_AUTH_KEY) !== "true"
    ) {
      return;
    }

    window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
    createDocument();
  }, [createDocument, isAuthenticated]);

  const deleteDoc = api.docs.deleteDoc.useMutation({
    onMutate: async ({ docId }) => {
      await utils.docs.getUserDocs.cancel();
      const previousDocuments = utils.docs.getUserDocs.getData();

      utils.docs.getUserDocs.setData(undefined, (currentDocuments) =>
        currentDocuments?.filter((document) => document.id !== docId),
      );

      return { previousDocuments };
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
    setIsSigningIn(true);

    if (createDraftAfterSignIn) {
      window.sessionStorage.setItem(CREATE_AFTER_AUTH_KEY, "true");
    }

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
        setIsSigningIn(false);
        showMessage("Unable to start Google sign-in", false);
      }
    } catch {
      window.sessionStorage.removeItem(CREATE_AFTER_AUTH_KEY);
      setIsSigningIn(false);
      showMessage("Unable to start Google sign-in", false);
    }
  };

  const handleStartWriting = async () => {
    if (isAuthenticated) {
      createDocument();
      return;
    }

    await startGoogleSignIn(true);
  };

  const handleAuthentication = async () => {
    if (!isAuthenticated) {
      await startGoogleSignIn(false);
      return;
    }

    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        showMessage("Unable to sign out", false);
        return;
      }

      await utils.invalidate();
      router.refresh();
    } catch {
      showMessage("Unable to sign out", false);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isStartWritingPending =
    isSessionLoading || isSigningIn || createDoc.isPending;
  const isAuthPending = isSessionLoading || isSigningIn || isSigningOut;

  if (isSessionLoading || (isAuthenticated && isLoading)) {
    return <Loading />;
  }

  if (isAuthenticated && error) {
    return <ServerError />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0D10] text-[#F5F5F7]">
      <div className="mx-auto max-w-3xl">
        <section className="px-6 pt-8 pb-12 sm:px-8 sm:pt-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-xs font-medium tracking-[0.12em] text-[#6B7280] uppercase">
              Your writing space
            </p>
            <button
              type="button"
              disabled={isAuthPending}
              onClick={() => {
                void handleAuthentication();
              }}
              className="min-h-11 cursor-pointer rounded-lg px-3 text-xs font-medium text-[#AEB4BE] transition-colors hover:bg-[#161B22] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] disabled:cursor-wait disabled:opacity-60"
            >
              {isSigningOut
                ? "Signing out…"
                : isAuthenticated
                  ? "Sign out"
                  : "Sign in"}
            </button>
          </div>

          <h1 className="max-w-full text-[clamp(2.25rem,12vw,3rem)] leading-[1.12] font-medium tracking-[-0.02em] text-[#F5F5F7] sm:text-5xl">
            What will you
            <br />
            write today
            <span
              aria-hidden="true"
              className="animate-blink ml-1 inline-block h-[0.9em] w-0.5 translate-y-px rounded-[1px] bg-[#F5F5F7] align-middle motion-reduce:animate-none"
            />
          </h1>

          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#8E96A3]">
            No folders. No clutter. Just you and the page.
          </p>

          <div className="mt-8">
            <button
              type="button"
              disabled={isStartWritingPending}
              onClick={() => {
                void handleStartWriting();
              }}
              className="min-h-12 cursor-pointer rounded-xl bg-[#F5F5F7] px-6 text-sm font-medium text-[#0B0D10] transition-all duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5F5F7] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {isStartWritingPending ? (
                <span className="flex items-center gap-2">
                  <LoadingIcon />
                  <span>Creating</span>
                </span>
              ) : (
                "Start writing"
              )}
            </button>
          </div>
        </section>

        {isAuthenticated && (
          <>
            <div className="mx-6 h-px bg-[#1E2530] sm:mx-8" />

            <section
              className="px-6 pt-9 pb-10 sm:px-8"
              aria-labelledby="recent-drafts"
            >
              <h2
                id="recent-drafts"
                className="mb-5 text-[11px] font-medium tracking-widest text-[#6B7280] uppercase"
              >
                Recent
              </h2>

              {!docs || docs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1E2530] px-5 py-12 text-center">
                  <p className="text-sm text-[#6B7280]">
                    Nothing yet — your drafts will appear here.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {docs.map(({ title, id, updatedAt }) => (
                    <DocItem
                      key={id}
                      title={title}
                      id={id}
                      updatedAt={updatedAt}
                      isDeleting={deleteDoc.isPending}
                      onDelete={(docId) => deleteDoc.mutate({ docId })}
                    />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
