import { TRPCClientError } from "@trpc/client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Parameter = {
    error: unknown,
    setMessage: React.Dispatch<React.SetStateAction<string>>,
    setIsSuccess?: React.Dispatch<React.SetStateAction<boolean | "IDLE">>,
    router?: AppRouterInstance,
    pathname?: string
}

export default function handleTRPCError({
    error,
    setMessage,
    setIsSuccess,
    router,
    pathname
}: Parameter) {
    setIsSuccess?.(false);

    if (!(error instanceof TRPCClientError)) {
        setMessage("Something went wrong. Please try again.");
        return;
    }

    const code = error.data?.code;

    const zodError = error.data?.zodError;

    if (zodError) {
        setMessage(zodError[0]?.message ?? "Invalid input");
        return;
    }

    switch (code) {
        case "BAD_REQUEST":
            setMessage("Invalid request.");
            return;

        case "UNAUTHORIZED":
            if (router && pathname) {
                router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
            }
            return;

        case "FORBIDDEN":
            setMessage("You do not have permission to do this.");
            return;

        case "NOT_FOUND":
            setMessage("The requested resource was not found.");
            return;

        case "CONFLICT":
            setMessage("This action conflicts with existing data.");
            return;

        case "TOO_MANY_REQUESTS":
            setMessage("Too many requests. Please try again later.");
            return;

        case "INTERNAL_SERVER_ERROR":
            setMessage("Server error. Please try again later.");
            return;

        default:
            setMessage(error.message || "Something went wrong.");
            return;
    }
}