"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";
import { useStatusMessage } from "./StatusMessageProvider";

export default function BetaUtilities() {
  const router = useRouter();
  const pathname = usePathname();
  const handleTRPCError = useHandleTRPCError();
  const { showMessage } = useStatusMessage();
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const submitFeedback = api.feedback.submit.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsOpen(false);
      showMessage("Thank you — your feedback was received.", true);
    },
    onError: (error) => {
      handleTRPCError({ error, router });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!session?.user || submitFeedback.isPending) {
      return;
    }

    submitFeedback.mutate({ message });
  };

  if (pathname === "/landing") {
    return null;
  }

  return (
    <>
      <div
        data-beta-utilities
        className="pointer-events-none fixed inset-x-3 bottom-3 z-30 flex flex-wrap items-center justify-center gap-2 sm:inset-x-5 sm:justify-between"
      >
        <div className="flex w-full items-center justify-end">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto min-h-10 cursor-pointer rounded-full border border-[var(--w-border)] bg-[var(--w-surface-raised)]/95 px-4 text-xs font-medium text-[var(--w-strong)] shadow-xl backdrop-blur transition-colors hover:bg-[var(--w-border-soft)]"
          >
            Send feedback
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-md rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
                  Writely beta
                </p>
                <h2
                  id="feedback-title"
                  className="mt-2 text-xl font-medium text-[var(--w-foreground)]"
                >
                  Share feedback
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close feedback form"
                className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-[var(--w-muted)] hover:bg-[var(--w-border-soft)] hover:text-[var(--w-foreground)]"
              >
                ×
              </button>
            </div>

            {session?.user ? (
              <form onSubmit={handleSubmit} className="mt-5">
                <label
                  htmlFor="feedback-message"
                  className="text-sm text-[var(--w-strong)]"
                >
                  What worked, or what should feel better?
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  minLength={10}
                  maxLength={2_000}
                  rows={6}
                  required
                  placeholder="Tell us about your experience…"
                  className="mt-2 w-full resize-y rounded-xl border border-[var(--w-border)] bg-[var(--w-background)] px-3 py-3 text-sm leading-6 text-[var(--w-foreground)] outline-none placeholder:text-[var(--w-subtle)]"
                />
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-xs text-[var(--w-subtle)]">
                    {message.length.toLocaleString()} / 2,000
                  </span>
                  <button
                    type="submit"
                    disabled={
                      submitFeedback.isPending || message.trim().length < 10
                    }
                    className="min-h-10 cursor-pointer rounded-lg bg-[var(--w-foreground)] px-4 text-xs font-medium text-[var(--w-background)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitFeedback.isPending ? "Sending…" : "Send feedback"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-5 rounded-xl border border-[var(--w-border)] bg-[var(--w-background)] px-4 py-3 text-sm leading-6 text-[var(--w-muted)]">
                Sign in from the Writely home page to send feedback.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
