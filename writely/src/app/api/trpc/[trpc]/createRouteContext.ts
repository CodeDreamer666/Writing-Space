import type { NextRequest } from "next/server";
import createTRPCContext from "~/server/trpc/createContext";

export default function createRouteContext(req: NextRequest) {
  return createTRPCContext({ headers: req.headers });
}
