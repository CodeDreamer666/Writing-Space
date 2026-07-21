"use client";

import { TRPCClientError } from "@trpc/client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import type { AppRouter } from "~/server/api/root";

type HandleTRPCErrorParams = {
  error: unknown;
  router: AppRouterInstance;
};

function isTRPCClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

export function useHandleTRPCError() {
  const { showMessage } = useStatusMessage();

  return function handleTRPCError({ error, router }: HandleTRPCErrorParams) {
    if (!isTRPCClientError(error)) {
      showMessage("Something went wrong", false);
      return;
    }

    const code = error.data?.code;
    const zodError = error.data?.zodError;

    if (zodError) {
      const validationMessage = [
        ...zodError.formErrors,
        ...Object.values(zodError.fieldErrors).flat(),
      ].find((message): message is string => typeof message === "string");

      showMessage(validationMessage ?? "Please check your input.", false);
      return;
    }

    if (!error.data) {
      showMessage(
        "We could not reach Writely. Check your connection and try again.",
        false,
      );
      return;
    }

    switch (code) {
      case "BAD_REQUEST":
        showMessage(error.message || "Please check your input.", false);
        return;

      case "UNAUTHORIZED":
        router.replace("/");
        return;

      case "FORBIDDEN":
        showMessage(
          error.message || "You do not have permission to do this.",
          false,
        );
        return;

      case "NOT_FOUND":
        showMessage(error.message || "That item could not be found.", false);
        return;

      case "CONFLICT":
        showMessage(
          error.message || "This writing was updated somewhere else.",
          false,
        );
        return;

      case "TOO_MANY_REQUESTS":
        showMessage(
          error.message || "Please wait a moment before trying again.",
          false,
        );
        return;

      case "INTERNAL_SERVER_ERROR":
        showMessage(
          error.message ||
            "Writely is unavailable right now. Please try again.",
          false,
        );
        return;

      default:
        showMessage("Something went wrong", false);
    }
  };
}
