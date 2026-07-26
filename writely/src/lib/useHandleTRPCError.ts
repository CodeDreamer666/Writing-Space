"use client";

import { TRPCClientError } from "@trpc/client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import { useUiLanguage } from "~/hooks/useUiLanguage";
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
  const { t } = useUiLanguage();

  return function handleTRPCError({ error, router }: HandleTRPCErrorParams) {
    if (!isTRPCClientError(error)) {
      showMessage(t("common.somethingWrong"), false);
      return;
    }

    const code = error.data?.code;
    const zodError = error.data?.zodError;

    if (zodError) {
      const validationMessage = [
        ...zodError.formErrors,
        ...Object.values(zodError.fieldErrors).flat(),
      ].find((message): message is string => typeof message === "string");

      showMessage(validationMessage ?? t("error.input"), false);
      return;
    }

    if (!error.data) {
      showMessage(t("error.connection"), false);
      return;
    }

    switch (code) {
      case "BAD_REQUEST":
        showMessage(error.message || t("error.input"), false);
        return;

      case "UNAUTHORIZED":
        router.replace("/app");
        return;

      case "FORBIDDEN":
        showMessage(error.message || t("error.permission"), false);
        return;

      case "NOT_FOUND":
        showMessage(error.message || t("error.notFound"), false);
        return;

      case "CONFLICT":
        showMessage(error.message || t("error.conflict"), false);
        return;

      case "TOO_MANY_REQUESTS":
        showMessage(error.message || t("error.wait"), false);
        return;

      case "INTERNAL_SERVER_ERROR":
        showMessage(error.message || t("error.unavailable"), false);
        return;

      default:
        showMessage(t("common.somethingWrong"), false);
    }
  };
}
