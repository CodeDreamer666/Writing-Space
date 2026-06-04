"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

export default function Auth() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/";

    return (
        <div className="min-h-screen bg-[#0B0D10] text-[#F5F5F7]">
            <div className="flex min-h-screen items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    <div className="flex gap-4 items-center justify-center mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F7] text-lg font-semibold text-[#0B0D10]">
                            W
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Welcome
                            </h1>

                            <p className="text-sm text-[#8E96A3]">
                                Continue where you left off.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={async () => {
                                await authClient.signIn.social({
                                    provider: "google",
                                    callbackURL: redirect,
                                });
                            }}
                            className="flex w-full items-center cursor-pointer justify-center gap-3 rounded-2xl border border-[#252B36] bg-[#12161C] px-4 py-3 font-medium transition-colors hover:bg-[#181D24]"
                        >
                            Continue with Google
                        </button>

                        <Link href="/" className="flex w-full items-center cursor-pointer justify-center gap-3 rounded-2xl border border-[#252B36] bg-[#12161C] px-4 py-3 font-medium transition-colors hover:bg-[#181D24]">
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}