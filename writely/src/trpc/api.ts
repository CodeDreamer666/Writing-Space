import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "~/server/routerTypes";

export default createTRPCReact<AppRouter>();
