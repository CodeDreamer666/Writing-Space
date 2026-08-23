import { TRPCClientError } from "@trpc/client";

export default function getTRPCErrorCode(error: unknown): string | undefined {
    if (!(error instanceof TRPCClientError)) return undefined;
    const data: unknown = error.data;
    if (
        typeof data === "object" &&
        data !== null &&
        "code" in data &&
        typeof data.code === "string"
    )
        return data.code;
    return undefined;
}
