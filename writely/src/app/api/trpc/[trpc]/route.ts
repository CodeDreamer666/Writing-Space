import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { isSameOriginRequest } from "~/server/security/requestOrigin";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) => {
  if (req.method === "POST" && !isSameOriginRequest(req)) {
    return new Response("Forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `[tRPC] ${path ?? "<unknown>"} failed with ${error.code}`,
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
