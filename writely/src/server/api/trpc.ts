import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "~/server/better-auth/config";
import { db } from "~/server/db";

export async function createTRPCContext({ headers }: { headers: Headers }) {
  const session = await auth.api.getSession({ headers });

  return { db, session, headers };
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const message =
      process.env.NODE_ENV === "production" &&
      shape.data.code === "INTERNAL_SERVER_ERROR"
        ? "Writely could not complete that request. Please try again."
        : shape.message;

    return {
      ...shape,
      message,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
