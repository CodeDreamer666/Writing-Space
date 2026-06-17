"use client"
import { api } from "~/trpc/react"
import { useRouter, usePathname } from "next/navigation";
import LoadingIcon from "~/app/components/LoadingIcon";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";
import { TRPCClientError } from "@trpc/client";
import Loading from "./components/Loading";
import ServerError from "./components/ServerError";
import DocItem from "./components/DocItem";
import handleTRPCError from "./libs/handleTRPCError";

export default function Home() {
    const router = useRouter();
    const pathname = usePathname();
    const utils = api.useUtils();

    const {
        data: docs,
        isLoading,
        error
    } = api.docs.getUserDocs.useQuery();

    const createDocs = api.docs.createDocs.useMutation({
        onSuccess: (newData) => {
            router.push(`/${newData.id}`)
        },

        onError: (error) => {
            handleTRPCError({
                error, router, pathname
            });
        },

        onSettled: async () => {
            await utils.invalidate();
        }
    });

    const { data: user } = authClient.useSession();

    if (isLoading) return <Loading />

    if (error) return <ServerError />

    return (
        <div className="min-h-screen bg-[#0B0D10] text-[#F5F5F7]">
            <div className="mx-auto max-w-3xl">

                {/* <div className="flex justify-end px-6 pt-5 sm:px-8">
                    {!user && (
                        <Link
                            href="/auth"
                            className="text-sm text-[#9AA1AC] transition-colors hover:text-[#F5F5F7]"
                        >
                            Sign in
                        </Link>
                    )}
                </div> */}

                <section className="px-6 pb-12 pt-10 sm:px-8 sm:pt-14">
                    <p className="mb-5 text-xs font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                        Your writing space
                    </p>

                    <h1 className="mb-0 text-4xl font-medium leading-[1.15] tracking-[-0.02em] text-[#F5F5F7] sm:text-5xl">
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
                            disabled={createDocs.isPending}
                            onClick={() => createDocs.mutate()}
                            className="rounded-xl cursor-pointer bg-[#F5F5F7] px-6 py-3 text-sm font-medium text-[#0B0D10] transition-all duration-200 hover:opacity-85 active:scale-[0.98] disabled:opacity-60"
                        >
                            {createDocs.isPending ? (
                                <div className="flex items-center gap-2">
                                    <LoadingIcon />
                                    <span>Creating...</span>
                                </div>
                            ) : "Start writing"}
                        </button>
                    </div>
                </section>

                {/* Divider */}
                <div className="mx-6 h-px bg-[#1E2530] sm:mx-8" />

                {/* Recent docs */}
                <section className="px-6 pb-10 pt-9 sm:px-8">
                    <p className="mb-5 text-[11px] font-medium uppercase tracking-widest text-[#6B7280]">
                        Recent
                    </p>

                    {docs?.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#1E2530] py-12 text-center">
                            <p className="text-sm text-[#6B7280]">
                                Nothing yet — your drafts will appear here.
                            </p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {docs?.map(({ title, id, updatedAt }) => (
                                <DocItem
                                    key={id}
                                    title={title}
                                    id={id}
                                    updatedAt={updatedAt}
                                />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}