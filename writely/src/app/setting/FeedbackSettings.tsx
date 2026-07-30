"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

export default function FeedbackSettings() {
  const router = useRouter();
  const handleTRPCError = useHandleTRPCError();
  const { showMessage } = useStatusMessage();
  const { data: session } = authClient.useSession();
  const [message, setMessage] = useState("");

  const submitFeedback = api.feedback.submit.useMutation({
    onSuccess: () => {
      setMessage("");
      showMessage("Thank you — your feedback was received.", true);
    },
    onError: (error) => {
      handleTRPCError({ error, router });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.user || submitFeedback.isPending) {
      return;
    }

    submitFeedback.mutate({ message });
  };

  if (!session?.user) {
    return (
      <p className="mt-5 rounded-xl border border-[var(--w-border)] bg-[var(--w-surface)] px-4 py-3">
        Sign in from the Writely home page to send feedback.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label
        htmlFor="feedback-message"
        className="text-sm font-medium text-[var(--w-strong)]"
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
        className="mt-2 w-full resize-y rounded-xl border border-[var(--w-border)] bg-[var(--w-surface)] px-3 py-3 text-sm leading-6 text-[var(--w-foreground)] outline-none placeholder:text-[var(--w-subtle)] focus:border-[var(--w-strong)]"
      />
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-xs text-[var(--w-subtle)]">
          {message.length.toLocaleString()} / 2,000
        </span>
        <button
          type="submit"
          disabled={submitFeedback.isPending || message.trim().length < 10}
          className="min-h-10 cursor-pointer rounded-lg bg-[var(--w-foreground)] px-4 text-xs font-medium text-[var(--w-background)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitFeedback.isPending ? "Sending…" : "Send feedback"}
        </button>
      </div>
    </form>
  );
}
