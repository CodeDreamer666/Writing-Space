"use client";

import Link from "next/link";
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

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-30 flex flex-wrap items-center justify-center gap-2 sm:inset-x-5 sm:justify-between">
        <p className="pointer-events-auto rounded-full border border-[#2A313C] bg-[#10151B]/95 px-4 py-2 text-[11px] leading-5 text-[#AEB4BE] shadow-xl backdrop-blur">
          Writely beta is designed for desktop and works best on a laptop or
          desktop computer.{" "}
          <Link
            href="/privacy"
            className="font-medium text-[#E5E7EA] underline decoration-[#596272] underline-offset-2"
          >
            Privacy
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto min-h-10 cursor-pointer rounded-full border border-[#394352] bg-[#151A20]/95 px-4 text-xs font-medium text-[#E5E7EA] shadow-xl backdrop-blur transition-colors hover:bg-[#1E2530]"
        >
          Send feedback
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-md rounded-2xl border border-[#2A313C] bg-[#10151B] p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
                  Writely beta
                </p>
                <h2
                  id="feedback-title"
                  className="mt-2 text-xl font-medium text-[#F5F5F7]"
                >
                  Share feedback
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close feedback form"
                className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-[#8E96A3] hover:bg-[#1E2530] hover:text-[#F5F5F7]"
              >
                ×
              </button>
            </div>

            {session?.user ? (
              <form onSubmit={handleSubmit} className="mt-5">
                <label
                  htmlFor="feedback-message"
                  className="text-sm text-[#D5D9DF]"
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
                  className="mt-2 w-full resize-y rounded-xl border border-[#2A313C] bg-[#0B0D10] px-3 py-3 text-sm leading-6 text-[#F5F5F7] outline-none placeholder:text-[#596272]"
                />
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#596272]">
                    {message.length.toLocaleString()} / 2,000
                  </span>
                  <button
                    type="submit"
                    disabled={
                      submitFeedback.isPending || message.trim().length < 10
                    }
                    className="min-h-10 cursor-pointer rounded-lg bg-[#F5F5F7] px-4 text-xs font-medium text-[#0B0D10] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitFeedback.isPending ? "Sending…" : "Send feedback"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-5 rounded-xl border border-[#2A313C] bg-[#0B0D10] px-4 py-3 text-sm leading-6 text-[#AEB4BE]">
                Sign in from the Writely home page to send feedback.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
