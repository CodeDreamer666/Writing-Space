import createRouter from "~/server/trpc/createRouter";
import accountRouter from "~/server/routers/account";
import aiRouter from "~/server/routers/ai";
import documentsRouter from "~/server/routers/documents";
import feedbackRouter from "~/server/routers/feedback";

const appRouter = createRouter({
  account: accountRouter,
  docs: documentsRouter,
  ai: aiRouter,
  feedback: feedbackRouter,
});

export default appRouter;
