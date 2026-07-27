"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { clearAllLocalDrafts } from "~/features/editor/utils/localDraft";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import {
  DEFAULT_INTERFACE_LANGUAGE,
  getStoredInterfaceLanguage,
  INTERFACE_LANGUAGE_CHANGE_EVENT,
  INTERFACE_LANGUAGES,
  storeInterfaceLanguage,
  type InterfaceLanguage,
} from "~/lib/writingLanguage";
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

export function InterfaceLanguageSettings() {
  const { t } = useUiLanguage();
  const language = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(INTERFACE_LANGUAGE_CHANGE_EVENT, onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(
          INTERFACE_LANGUAGE_CHANGE_EVENT,
          onStoreChange,
        );
      };
    },
    getStoredInterfaceLanguage,
    () => DEFAULT_INTERFACE_LANGUAGE,
  );

  const handleChange = (nextLanguage: InterfaceLanguage) => {
    storeInterfaceLanguage(nextLanguage);
  };

  return (
    <label className="mt-5 block max-w-sm">
      <span className="sr-only">{t("settings.languageLabel")}</span>
      <select
        suppressHydrationWarning
        value={language}
        onChange={(event) =>
          handleChange(event.target.value as InterfaceLanguage)
        }
        className="min-h-11 w-full rounded-xl border border-[var(--w-border)] bg-[var(--w-surface)] px-3 text-sm text-[var(--w-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
      >
        {INTERFACE_LANGUAGES.map((option) => (
          <option key={option} value={option}>
            {option === "English"
              ? t("settings.englishDefault")
              : option === "Chinese"
                ? t("settings.chinese")
                : option === "Malay"
                  ? t("settings.malay")
                  : t("settings.tamil")}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const { t } = useUiLanguage();
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
      showMessage(t("settings.signOutError"), false);
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
      {isSigningOut ? t("settings.signingOut") : t("settings.signOut")}
    </button>
  );
}

export function ClearRecoveryDataControl() {
  const { showMessage } = useStatusMessage();
  const { t } = useUiLanguage();

  return (
    <button
      type="button"
      onClick={() => {
        clearAllLocalDrafts();
        showMessage(t("settings.recoveryCleared"), true);
      }}
      className="mt-5 min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
    >
      {t("settings.clearRecovery")}
    </button>
  );
}

export function DownloadAccountDataControl() {
  const utils = api.useUtils();
  const { showMessage } = useStatusMessage();
  const { t } = useUiLanguage();
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
      showMessage(t("settings.exportReady"), true);
    } catch {
      showMessage(t("settings.exportError"), false);
    } finally {
      requestRef.current = false;
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-[var(--w-border-soft)] pt-6">
      <p className="text-[var(--w-strong)]">
        {t("settings.accountExportDescription")}
      </p>
      <button
        type="button"
        disabled={isDownloading}
        onClick={() => {
          void handleDownload();
        }}
        className="mt-4 min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] disabled:cursor-wait disabled:opacity-60"
      >
        {isDownloading
          ? t("settings.exportingData")
          : t("settings.downloadData")}
      </button>
    </div>
  );
}

export function DeleteAccountControl() {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const { t } = useUiLanguage();
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
      showMessage(t("settings.deleteAccountError"), false);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (!isConfirming) {
    return (
      <div className="mt-8 border-t border-[var(--w-border-soft)] pt-6">
        <p className="text-[var(--w-strong)]">
          {t("settings.deleteAccountDescription")}
        </p>
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="mt-4 min-h-11 cursor-pointer rounded-xl border border-red-700/50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-500/10 dark:text-red-300"
        >
          {t("settings.deleteAccount")}
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
        {t("settings.deleteAccountConfirmTitle")}
      </h3>
      <p id="delete-account-description" className="mt-2">
        {t("settings.deleteAccountConfirmDescription")}
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
          {isDeleting
            ? t("settings.deletingAccount")
            : t("settings.confirmDeleteAccount")}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setIsConfirming(false)}
          className="min-h-11 cursor-pointer rounded-xl border border-[var(--w-border)] px-4 text-sm font-medium text-[var(--w-muted)] transition-colors hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)] disabled:cursor-wait disabled:opacity-60"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
