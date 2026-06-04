"use client"
import { api } from "~/trpc/react"
import { useRouter, usePathname } from "next/navigation";
import LoadingIcon from "~/components/LoadingIcon";
import { authClient } from "~/server/better-auth/client";
import Link from "next/link";
import { TRPCClientError } from "@trpc/client";

export default function Home() {
    const router = useRouter();
    const pathname = usePathname();

    const createDocs = api.docs.createDocs.useMutation({
        onSuccess: (newData) => {
            router.push(`/${newData.id}`)
        },

        onError: (error) => {
            if (error instanceof TRPCClientError && error.data.code === "UNAUTHORIZED") {
                router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
            }
        }
    });

    const { data: user } = authClient.useSession();

    return (
        <div className="min-h-screen bg-[#0B0D10]">
            <div className="text-[#F5F5F7] mx-auto flex flex-col px-6 py-10">

                {!user ? (
                    <div className="flex items-center justify-end">
                        <Link href="/auth" className="text-sm mb-4 cursor-pointer text-[#8E96A3] transition-colors hover:text-[#F5F5F7]">
                            Sign In
                        </Link>
                    </div>
                ) : ""}

                <section className="mb-10">
                    <h1 className="mb-6 text-4xl font-semibold tracking-tight">
                        What would you like to write?
                    </h1>

                    <button
                        disabled={createDocs.isPending}
                        onClick={() => createDocs.mutate()}
                        className="rounded-2xl cursor-pointer bg-[#F5F5F7] px-6 py-3 text-sm font-medium text-[#0B0D10] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {createDocs.isPending ? (
                            <div className="flex items-center gap-2">
                                <LoadingIcon />
                                <p>Creating...</p>
                            </div>
                        ) : "Start Writing"}
                    </button>
                </section>

                <section className="mb-10">
                    <h2 className="mb-4 text-sm font-medium text-[#8E96A3]">
                        Recent
                    </h2>

                    <div className="space-y-1">
                        <button
                            className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#12161C]"
                        >
                            <span className="font-medium">
                                The Future of AI
                            </span>
                            <span className="text-sm text-[#8E96A3]">
                                2h ago
                            </span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}