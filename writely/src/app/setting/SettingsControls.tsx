"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { clearAllLocalDrafts } from "~/features/editor/utils/localDraft";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

type AccountAction = "signOut" | "download" | "delete";

export default function AccountSettings() {
  const router = useRouter();
  const utils = api.useUtils();
  const { showMessage } = useStatusMessage();
  const { data: session } = authClient.useSession();
  const requestInFlight = useRef(false);
  const [activeAction, setActiveAction] = useState<AccountAction | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!session?.user) {
    return null;
  }

  const runAccountAction = async (
    action: AccountAction,
    request: () => Promise<void>,
  ) => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setActiveAction(action);

    try {
      await request();
    } catch {
      showMessage(
        action === "delete"
          ? "Unable to delete your account. For security, sign out and sign in again, then retry."
          : action === "download"
            ? "Unable to prepare your data export. Please try again."
            : "Unable to sign out. Please try again.",
        false,
      );
    } finally {
      requestInFlight.current = false;
      setActiveAction(null);
    }
  };

  const signOut = () =>
    runAccountAction("signOut", async () => {
      const result = await authClient.signOut();

      if (result.error) {
        showMessage("Unable to sign out. Please try again.", false);
        return;
      }

      router.push("/");
      router.refresh();
    });

  const downloadData = () =>
    runAccountAction("download", async () => {
      try {
        const exportedData = await utils.client.account.exportData.query();
        const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
          type: "application/json;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "writely-data-export.json";
        link.click();
        URL.revokeObjectURL(url);
        showMessage("Your Writely data export is ready.", true);
      } catch {
        showMessage(
          "Unable to prepare your data export. Please try again.",
          false,
        );
      }
    });

  const deleteAccount = () =>
    runAccountAction("delete", async () => {
      const result = await authClient.deleteUser();

      if (result.error) {
        showMessage(
          "Unable to delete your account. For security, sign out and sign in again, then retry.",
          false,
        );
        return;
      }

      clearAllLocalDrafts();
      router.push("/");
      router.refresh();
    });

  const isBusy = activeAction !== null;

  return (
    <section className="py-10">
      <h2 className="text-xl font-medium text-(--w-foreground)">Account</h2>
      <div className="mt-3 text-sm leading-7 text-(--w-muted)">
        <p>Sign out of Writely on this device.</p>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void signOut()}
          className="mt-5 min-h-11 cursor-pointer rounded-xl border border-(--w-border) px-4 font-medium transition-colors hover:bg-(--w-surface-raised) hover:text-(--w-foreground) disabled:cursor-wait disabled:opacity-60"
        >
          {activeAction === "signOut" ? "Signing out…" : "Sign out"}
        </button>

        <div className="mt-8 border-t border-(--w-border-soft) pt-6">
          <p className="text-(--w-strong)">
            Download your account details, documents, preferences, AI usage
            totals, feedback, sessions, and connected-account information as
            JSON. Authentication tokens are excluded.
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void downloadData()}
            className="mt-4 min-h-11 cursor-pointer rounded-xl border border-(--w-border) px-4 font-medium transition-colors hover:bg-(--w-surface-raised) hover:text-(--w-foreground) disabled:cursor-wait disabled:opacity-60"
          >
            {activeAction === "download"
              ? "Preparing export…"
              : "Download my data"}
          </button>
        </div>

        <div className="mt-8 border-t border-(--w-border-soft) pt-6">
          <p className="text-(--w-strong)">
            Permanently delete your Writely account and all of its documents.
          </p>

          {!isConfirmingDelete ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingDelete(true)}
              className="mt-4 min-h-11 cursor-pointer rounded-xl border border-red-700/50 px-4 font-medium text-red-700 transition-colors hover:bg-red-500/10 disabled:opacity-60 dark:text-red-300"
            >
              Delete account
            </button>
          ) : (
            <div
              role="alertdialog"
              aria-labelledby="delete-account-title"
              aria-describedby="delete-account-description"
              className="mt-4 rounded-xl border border-red-700/40 bg-red-500/5 p-5"
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
                  disabled={isBusy}
                  onClick={() => void deleteAccount()}
                  className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-4 font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {activeAction === "delete"
                    ? "Deleting account…"
                    : "Permanently delete account"}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="min-h-11 cursor-pointer rounded-xl border border-(--w-border) px-4 font-medium transition-colors hover:bg-(--w-surface-raised) hover:text-(--w-foreground) disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
