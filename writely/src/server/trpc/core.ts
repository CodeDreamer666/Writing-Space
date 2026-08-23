import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type createTRPCContext from "./createContext";

export default initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
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
