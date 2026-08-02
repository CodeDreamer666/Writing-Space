"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";

export default function AccountSettings() {
    const router = useRouter();
    const handleTRPCError = useHandleTRPCError();

    const { data: session } = authClient.useSession();

    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (!session?.user) {
        return null;
    }

    const deleteAccount = api.account.deleteAccount.useMutation({
        onSuccess: () => {
            setIsConfirmingDelete(false);
            router.replace("/")
        },

        onError: (error) => {
            handleTRPCError({ error, router })
        }
    });

    return (
        <section className="py-10">
            <h2 className="text-xl font-medium text-(--w-foreground)">Account</h2>
            <div className="mt-3 text-sm leading-7 text-(--w-muted)">
                <div className="flex max-sm:flex-col max-sm:gap-2 sm:justify-between sm:items-center">
                    <p>Sign out of Writely on this device.</p>
                    <button
                        type="button"
                        disabled={isSigningOut}
                        onClick={async () => {
                            setIsSigningOut(true);

                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/");
                                    },
                                },
                            });

                            setIsSigningOut(false);
                        }}
                        className={[
                            "min-h-11 cursor-pointer rounded-xl",
                            "border border-(--w-border) px-4 font-medium",
                            "transition-colors hover:bg-(--w-surface-raised) hover:text-(--w-foreground) disabled:cursor-wait",
                            "disabled:opacity-60",
                        ].join(" ")}
                    >
                        {isSigningOut ? "Signing out..." : "Sign out"}
                    </button>
                </div>

                <div className="mt-8 flex max-sm:flex-col max-sm:gap-2 sm:justify-between sm:items-center border-t border-(--w-border-soft) pt-6">
                    <p className="text-(--w-muted)">
                        Permanently delete your Writely account and all of its documents.
                    </p>

                    {!isConfirmingDelete && (
                        <button
                            type="button"
                            disabled={isConfirmingDelete}
                            onClick={() => setIsConfirmingDelete(true)}
                            className="min-h-11 cursor-pointer rounded-xl border border-red-700/50 px-4 font-medium text-red-700 transition-colors hover:bg-red-500/10 disabled:opacity-60 dark:text-red-300"
                        >
                            Delete account
                        </button>
                    )}
                </div>

                {isConfirmingDelete && (
                    <div
                        role="alertdialog"
                        aria-labelledby="delete-account-title"
                        aria-describedby="delete-account-description"
                        className="mt-4 z-50 rounded-xl border border-red-700/40 bg-red-500/5 p-5"
                    >
                        <h3
                            id="delete-account-title"
                            className="font-medium text-(--w-foreground)"
                        >
                            Delete your Writely account?
                        </h3>
                        <p id="delete-account-description" className="mt-2">
                            This permanently deletes your documents, account data, and
                            recovery copies on this browser. This cannot be undone.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                disabled={deleteAccount.isPending}
                                onClick={() => deleteAccount.mutate()}
                                className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-4 font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                            >
                                {deleteAccount.isPending
                                    ? "Deleting account…"
                                    : "Permanently delete account"}
                            </button>
                            <button
                                type="button"
                                disabled={deleteAccount.isPending}
                                onClick={() => setIsConfirmingDelete(false)}
                                className="min-h-11 cursor-pointer rounded-xl border border-(--w-border) px-4 font-medium transition-colors hover:bg-(--w-surface-raised) hover:text-(--w-foreground) disabled:opacity-60"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
