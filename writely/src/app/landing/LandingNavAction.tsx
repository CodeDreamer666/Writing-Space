"use client";

import Link from "next/link";
import { useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { authClient } from "~/server/better-auth/client";

const actionClassName =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--w-border)] bg-[var(--w-surface)] px-4 text-sm font-medium text-[var(--w-strong)] shadow-sm transition-colors hover:border-[var(--w-muted)] hover:bg-[var(--w-surface-raised)] disabled:cursor-wait disabled:opacity-60";

export default function LandingNavAction() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { showMessage } = useStatusMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (session?.user) {
    return (
      <Link href="/" className={actionClassName}>
        Open app
      </Link>
    );
  }

  const startGoogleSignIn = async () => {
    if (isSessionPending || isSigningIn) {
      return;
    }

    setIsSigningIn(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/landing",
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

  return (
    <button
      type="button"
      onClick={() => {
        void startGoogleSignIn();
      }}
      disabled={isSessionPending || isSigningIn}
      aria-busy={isSigningIn}
      className={actionClassName}
    >
      {isSigningIn ? "Signing in…" : "Sign in"}
    </button>
  );
}
