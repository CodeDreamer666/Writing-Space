import { createTRPCRouter } from "~/server/api/trpc";
import { docsRouter } from "./routers/docs";
import { aiRouter } from "./routers/ai";
import { feedbackRouter } from "./routers/feedback";
import { accountRouter } from "./routers/account";

export const appRouter = createTRPCRouter({
  account: accountRouter,
  docs: docsRouter,
  ai: aiRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
