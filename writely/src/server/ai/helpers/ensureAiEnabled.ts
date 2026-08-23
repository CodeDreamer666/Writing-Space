import { env, TRPCError } from "../support";

export default function ensureAiEnabled() {
  if (env.AI_ENABLED !== "true") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Writely AI is temporarily unavailable. You can keep writing and saving normally.",
    });
  }
}
