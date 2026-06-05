import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { docsRouter } from "./routers/docs";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
    docs: docsRouter,
    ai: aiRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
