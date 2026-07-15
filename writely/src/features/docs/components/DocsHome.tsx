"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import Loading from "~/components/shared/Loading";
import LoadingIcon from "~/components/shared/LoadingIcon";
import ServerError from "~/components/shared/ServerError";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import DocItem from "./DocItem";

export default function DocsHome() {
    const router = useRouter();
    const utils = api.useUtils();
    const handleTRPCError = useHandleTRPCError();
    const { showMessage } = useStatusMessage();

    const [isSigningIn, setIsSigningIn] = useState(false);

    const { data: session, isPending: isSessionLoading } =
        authClient.useSession();

    const isAuthenticated = Boolean(session?.user);

    const { data: docs, isLoading, error } = api.docs.getUserDocs.useQuery(
        undefined,
        {
            enabled: isAuthenticated,
        },
    );

    const createDoc = api.docs.createDoc.useMutation({
        onSuccess: (newData) => {
            router.push(`/${newData.id}`);
        },

        onError: (error) => {
            handleTRPCError({
                error,
                router,
            });
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const handleStartWriting = async () => {
        if (isAuthenticated) {
            createDoc.mutate();
            return;
        }

        setIsSigningIn(true);

        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/api/create-draft",
            });

            if (result.error) {
                setIsSigningIn(false);
                showMessage("Unable to start Google sign-in", false);
            }
        } catch {
            setIsSigningIn(false);
            showMessage("Unable to start Google sign-in", false);
        }
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
        <div className="min-h-screen bg-[#0B0D10] text-[#F5F5F7]">
            <div className="mx-auto max-w-3xl">
                <section className="px-6 pt-10 pb-12 sm:px-8 sm:pt-14">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <p className="text-xs font-medium tracking-[0.12em] text-[#6B7280] uppercase">
                            Your writing space
                        </p>
                    </div>

                    <h1 className="mb-0 text-4xl leading-[1.15] font-medium tracking-[-0.02em] text-[#F5F5F7] sm:text-5xl">
                        What will you
                        <br />
                        write today
                        <span className="animate-blink ml-1 inline-block h-[0.9em] w-0.5 translate-y-px rounded-[1px] bg-[#F5F5F7] align-middle" />
                    </h1>

                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#8E96A3]">
                        No folders. No clutter. Just you and the page.
                    </p>

                    <div className="mt-8">
                        <button
                            disabled={isStartWritingPending}
                            onClick={() => {
                                void handleStartWriting();
                            }}
                            className="cursor-pointer rounded-xl bg-[#F5F5F7] px-6 py-3 text-sm font-medium text-[#0B0D10] transition-all duration-200 hover:opacity-85 active:scale-[0.98] disabled:opacity-60"
                        >
                            {isStartWritingPending ? (
                                <div className="flex items-center gap-2">
                                    <LoadingIcon />
                                    <span>
                                        Creating
                                    </span>
                                </div>
                            ) : (
                                "Start writing"
                            )}
                        </button>
                    </div>
                </section>

                <div className="mx-6 h-px bg-[#1E2530] sm:mx-8" />

                <section className="px-6 pt-9 pb-10 sm:px-8">
                    <p className="mb-5 text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
                        Recent
                    </p>

                    {!docs || docs.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#1E2530] py-12 text-center">
                            <p className="text-sm text-[#6B7280]">
                                Nothing yet - your drafts will appear here.
                            </p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {docs.map(({ title, id, updatedAt }) => (
                                <DocItem key={id} title={title} id={id} updatedAt={updatedAt} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
