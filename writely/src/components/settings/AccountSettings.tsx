"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clearAllLocalDrafts from "~/features/editor/utils/localDraft/clearAllLocalDrafts";
import authClient from "~/server/better-auth/client";
import api from "~/trpc/api";
import useHandleTRPCError from "~/trpc/useHandleTRPCError";

export default function AccountSettings() {
  const router = useRouter();
  const handleTRPCError = useHandleTRPCError();

  const { data: session } = authClient.useSession();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const deleteAccount = api.account.deleteAccount.useMutation({
    onSuccess: () => {
      clearAllLocalDrafts();
      setIsConfirmingDelete(false);
      router.replace("/");
    },

    onError: (error) => {
      handleTRPCError({ error, router });
    },
  });

  if (!session?.user) {
    return null;
  }

  return (
    <section className="grid gap-5 py-9 sm:py-11 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <h2 className="font-mono-label text-[11px] tracking-[0.18em] uppercase">
        Account
      </h2>
      <div className="text-[15px] leading-[1.75] text-(--w-muted)">
        <div className="flex flex-col gap-4 border-b border-(--w-border-soft) pb-6 sm:flex-row sm:items-center sm:justify-between">
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
              "h-[46px] cursor-pointer",
              "border border-(--w-border) px-4 font-medium",
              "bg-transparent transition-colors hover:border-(--w-foreground) hover:bg-(--w-surface-raised) hover:text-(--w-foreground) disabled:cursor-wait",
              "disabled:opacity-60",
            ].join(" ")}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-(--w-muted)">
            Permanently delete your Writely account and all of its documents.
          </p>

          {!isConfirmingDelete && (
            <button
              type="button"
              disabled={isConfirmingDelete}
              onClick={() => setIsConfirmingDelete(true)}
              className="h-[46px] cursor-pointer border border-(--w-foreground) bg-transparent px-5 font-medium text-(--w-foreground) transition-colors hover:bg-(--w-foreground) hover:text-(--w-background) disabled:opacity-60"
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
            className="mt-[22px] border border-(--w-foreground) bg-(--w-background) p-6"
          >
            <h3
              id="delete-account-title"
              className="font-display text-[21px] font-normal text-(--w-foreground)"
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
                className="h-[46px] cursor-pointer bg-(--w-foreground) px-5 font-medium text-(--w-background) disabled:cursor-wait disabled:opacity-60"
              >
                {deleteAccount.isPending
                  ? "Deleting account…"
                  : "Permanently delete account"}
              </button>
              <button
                type="button"
                disabled={deleteAccount.isPending}
                onClick={() => setIsConfirmingDelete(false)}
                className="h-[46px] cursor-pointer border border-(--w-border) bg-transparent px-5 font-medium transition-colors hover:border-(--w-foreground) hover:text-(--w-foreground) disabled:opacity-60"
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
