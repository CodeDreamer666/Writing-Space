"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

      console.log(result);

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

  const isStartWritingPending =
    isSessionLoading || isSigningIn || createDoc.isPending;

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
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2 text-[#6B7280]">
                <span className="text flex h-12 w-12 items-center justify-center rounded-md border border-[#2A313C] font-medium text-[#AEB4BE]">
                  W
                </span>
                <span className="text tracking-[0.12em] uppercase">
                  Writely
                </span>
              </div>

              <Link
                href="/setting"
                aria-label="Settings and help"
                className="flex size-10 items-center justify-center rounded-lg text-[#8E96A3] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="max-w-full text-[clamp(2.25rem,12vw,3rem)] leading-[1.12] font-medium tracking-[-0.02em] text-[#F5F5F7] sm:text-5xl">
              What will you write today
              <span
                aria-hidden="true"
                className="animate-blink ml-1 inline-block h-[0.9em] w-0.5 translate-y-px rounded-[1px] bg-[#F5F5F7] align-middle motion-reduce:animate-none"
              />
            </h1>

            <button
              type="button"
              disabled={isStartWritingPending}
              onClick={() => {
                handleStartWriting();
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

          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#8E96A3]">
            A quiet space to think, write, and continue.
          </p>
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
                Recent Document
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
