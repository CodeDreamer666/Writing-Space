export {
  DAILY_AI_TOKEN_LIMIT,
  MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";

export function getUtcUsageDate(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
