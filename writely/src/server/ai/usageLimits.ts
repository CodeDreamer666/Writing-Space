export {
  DAILY_AI_TOKEN_LIMIT,
  MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";

export function getUtcUsageDate(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function estimateInputTokens(messageContents: string[]): number {
  const utf8Bytes = messageContents.reduce(
    (total, content) => total + Buffer.byteLength(content, "utf8"),
    0,
  );

  // A byte-based upper estimate is intentionally conservative so provider
  // tokenization cannot push a user beyond the hard daily allowance.
  return utf8Bytes + messageContents.length * 32;
}

export function formatTokensRemaining(tokens: number): string {
  return `${Math.max(0, tokens).toLocaleString("en-US")} tokens remaining today.`;
}
