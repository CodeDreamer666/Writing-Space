"use client";

import { TRPCClientError } from "@trpc/client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import type { AppRouter } from "~/server/api/root";

type HandleTRPCErrorParams = {
  error: unknown;
  router: AppRouterInstance;
  pathname: string;
};

function isTRPCClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

export function useHandleTRPCError() {
  const { showMessage } = useStatusMessage();

  return function handleTRPCError({
    error,
    router,
    pathname,
  }: HandleTRPCErrorParams) {
    if (!isTRPCClientError(error)) {
      showMessage("Something went wrong", false);
      return;
    }

    const code = error.data?.code;
    const zodError = error.data?.zodError;

    if (zodError) {
      showMessage("Invalid input", false);
      return;
    }

    switch (code) {
      case "BAD_REQUEST":
        showMessage("Invalid input", false);
        return;

      case "UNAUTHORIZED":
        router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
        return;

      case "FORBIDDEN":
        showMessage("You do not have permission to do this.", false);
        return;

      case "NOT_FOUND":
        showMessage("Not found", false);
        return;

      case "CONFLICT":
        showMessage("This action conflicts with existing data", false);
        return;

      case "TOO_MANY_REQUESTS":
        showMessage("Too many requests", false);
        return;

      case "INTERNAL_SERVER_ERROR":
        showMessage("Server unavailable", false);
        return;

      default:
        showMessage("Something went wrong", false);
    }
  };
}
