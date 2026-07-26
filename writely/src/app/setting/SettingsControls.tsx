"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
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
