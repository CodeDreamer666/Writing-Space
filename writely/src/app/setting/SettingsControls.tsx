"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { clearAllLocalDrafts } from "~/features/editor/utils/localDraft";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

export function AuthenticatedAccount({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  return children;
}

export function SignOutButton() {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const { data: session } = authClient.useSession();
  const requestRef = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (requestRef.current) {
      return;
    }

    requestRef.current = true;
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error("Sign out failed");
      }

      router.push("/");
      router.refresh();
    } catch {
      requestRef.current = false;
      setIsSigningOut(false);
      showMessage("Unable to sign out. Please try again.", false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={() => {
        void handleSignOut();
      }}
      className="mt-5 min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] disabled:cursor-wait disabled:opacity-60"
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function ClearRecoveryDataControl() {
  const { showMessage } = useStatusMessage();

  return (
    <button
      type="button"
      onClick={() => {
        clearAllLocalDrafts();
        showMessage(
          "Browser recovery copies have been cleared on this device.",
          true,
        );
      }}
      className="mt-5 min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
    >
      Clear browser recovery copies
    </button>
  );
}

export function DownloadAccountDataControl() {
  const utils = api.useUtils();
  const { showMessage } = useStatusMessage();
  const requestRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (requestRef.current) {
      return;
    }

    requestRef.current = true;
    setIsDownloading(true);

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
    } finally {
      requestRef.current = false;
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-[var(--w-border-soft)] pt-6">
      <p className="text-[var(--w-strong)]">
        Download your account details, documents, preferences, AI usage totals,
        feedback, session details, and connected-account information as JSON.
        Authentication tokens are excluded.
      </p>
      <button
        type="button"
        disabled={isDownloading}
        onClick={() => {
          void handleDownload();
        }}
        className="mt-4 min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] disabled:cursor-wait disabled:opacity-60"
      >
        {isDownloading ? "Preparing export…" : "Download my data"}
      </button>
    </div>
  );
}

export function DeleteAccountControl() {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const { data: session } = authClient.useSession();
  const requestRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (requestRef.current) {
      return;
    }

    requestRef.current = true;
    setIsDeleting(true);

    try {
      const result = await authClient.deleteUser();

      if (result.error) {
        throw new Error("Account deletion failed");
      }

      clearAllLocalDrafts();
      router.push("/");
      router.refresh();
    } catch {
      requestRef.current = false;
      setIsDeleting(false);
      showMessage(
        "Unable to delete your account. For security, sign out and sign in again, then retry.",
        false,
      );
    }
  };

  if (!session?.user) {
    return null;
  }

  if (!isConfirming) {
    return (
      <div className="mt-8 border-t border-[var(--w-border-soft)] pt-6">
        <p className="text-[var(--w-strong)]">
          Permanently delete your Writely account and all of its documents.
        </p>
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="mt-4 min-h-11 cursor-pointer rounded-xl border border-red-700/50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-500/10 dark:text-red-300"
        >
          Delete account
        </button>
      </div>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
      className="mt-8 rounded-xl border border-red-700/40 bg-red-500/5 p-5"
    >
      <h3
        id="delete-account-title"
        className="font-medium text-[var(--w-foreground)]"
      >
        Delete your Writely account?
      </h3>
      <p id="delete-account-description" className="mt-2">
        This permanently deletes your documents, account data, and recovery
        copies on this browser. This cannot be undone. You can sign in again
        later with the same email to create a new, empty account.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            void handleDelete();
          }}
          className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-4 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isDeleting ? "Deleting account…" : "Permanently delete account"}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setIsConfirming(false)}
          className="min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] disabled:cursor-wait disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
