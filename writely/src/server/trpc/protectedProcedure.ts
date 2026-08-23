import { TRPCError } from "@trpc/server";
import trpc from "./core";

export default trpc.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});
