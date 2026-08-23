"use client";
import { useEffect, useState } from "react";
import StatusMessageContext from "~/contexts/statusMessageContext";
import cleanupStaleLocalDrafts from "~/features/editor/utils/localDraft/cleanupStaleLocalDrafts";

export default function StatusMessageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSuccess, setIsSuccess] = useState<boolean | "IDLE">("IDLE");
  const [message, setMessage] = useState("");

  const dismiss = () => {
    setIsSuccess("IDLE");
    setMessage("");
  };

  useEffect(() => cleanupStaleLocalDrafts(), []);

  useEffect(() => {
    if (isSuccess === "IDLE") return;
    const timer = setTimeout(
      () => {
        setIsSuccess("IDLE");
        setMessage("");
      },
      isSuccess ? 3_000 : 5_000,
    );
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const showMessage = (nextMessage: string, nextIsSuccess: boolean) => {
    setMessage(nextMessage);
    setIsSuccess(nextIsSuccess);
  };

  return (
    <StatusMessageContext.Provider value={{ showMessage }}>
      {isSuccess !== "IDLE" && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-50">
          <div className="mx-auto flex max-w-6xl justify-end px-4">
            <section
              role={isSuccess ? "status" : "alert"}
              aria-live={isSuccess ? "polite" : "assertive"}
              className={`pointer-events-auto flex items-center gap-4 rounded-2xl border px-5 py-4 text-white backdrop-blur transition-all duration-300 ${isSuccess ? "border-emerald-500/20 bg-neutral-900" : "border-red-500/20 bg-neutral-900"}`}
            >
              <p className="text-sm font-medium">{message}</p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                ×
              </button>
            </section>
          </div>
        </div>
      )}
      {children}
    </StatusMessageContext.Provider>
  );
}
