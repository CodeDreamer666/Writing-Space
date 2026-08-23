import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "~/server/routerTypes";

export default function isTRPCClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}
