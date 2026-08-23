import { TRPCError } from "@trpc/server";
import Groq from "groq-sdk";
import type { ChatCompletion } from "groq-sdk/resources/chat/completions";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "~/env";
import {
    AI_FALLBACK_OUTPUT_TOKEN_LIMIT,
    DAILY_AI_TOKEN_LIMIT,
    MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import containsUnsupportedPictographs from "~/lib/containsUnsupportedPictographs";
import { UNSUPPORTED_PICTOGRAPH_MESSAGE } from "~/lib/writingLanguage";
import buildAiSystemMessage from "~/server/ai/buildAiSystemMessage";
import getAiActionInstruction from "~/server/ai/getAiActionInstruction";
import getAiRetryInstruction from "~/server/ai/getAiRetryInstruction";
import { AI_ACTIONS } from "~/types/ai";
import { WRITING_MODES } from "~/types/writing";
import getUtcUsageDate from "./helpers/getUtcUsageDate";
import hasThreeOrFourSentences from "./helpers/hasThreeOrFourSentences";
import escapeHtml from "./helpers/escapeHtml";
import sanitizeRichText from "./helpers/sanitizeRichText";
import decodeHtmlEntities from "./helpers/decodeHtmlEntities";
import normalizeWhitespace from "./helpers/normalizeWhitespace";
import normalizePlainText from "./helpers/normalizePlainText";
import normalizeRichText from "./helpers/normalizeRichText";
import hasRichTextContent from "./helpers/hasRichTextContent";
import parseRewriteResponse from "./helpers/parseRewriteResponse";
import readUsableCompletion from "./helpers/readUsableCompletion";
import getInputTokenUpperBound from "./helpers/getInputTokenUpperBound";
import ensureAiEnabled from "./helpers/ensureAiEnabled";

export const AI_REQUEST_TIMEOUT_MS = 45000;
export const AI_REQUEST_LEASE_MS = 120000;
export const AI_MESSAGE_TOKEN_OVERHEAD = 32;
export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const rewriteResponseSchema = z.object({
    improved: z.string().trim().min(1),
    changes: z
        .string()
        .trim()
        .min(1)
        .refine(
            hasThreeOrFourSentences,
            "The rewrite explanation must contain 3 or 4 sentences.",
        ),
});

export const anyHtmlTagPattern = /<[^>]*>/g;
export const blockHtmlTagPattern =
    /<\s*\/?\s*(?:p|h[1-6]|ul|ol|li|blockquote|br)\b[^>]*>/gi;
export const allowedRichTextTagPattern =
    /^<\s*(\/?)\s*(p|h[1-3]|ul|ol|li|strong|em|br)\s*\/?\s*>$/i;

export {
    TRPCError,
    Groq,
    randomUUID,
    z,
    env,
    AI_FALLBACK_OUTPUT_TOKEN_LIMIT,
    DAILY_AI_TOKEN_LIMIT,
    MAX_AI_SELECTION_CHARACTERS,
    containsUnsupportedPictographs,
    UNSUPPORTED_PICTOGRAPH_MESSAGE,
    buildAiSystemMessage,
    getAiActionInstruction,
    getAiRetryInstruction,
    AI_ACTIONS,
    WRITING_MODES,
    getUtcUsageDate,
    hasThreeOrFourSentences,
    escapeHtml,
    sanitizeRichText,
    decodeHtmlEntities,
    normalizeWhitespace,
    normalizePlainText,
    normalizeRichText,
    hasRichTextContent,
    parseRewriteResponse,
    readUsableCompletion,
    getInputTokenUpperBound,
    ensureAiEnabled,
};

export type { ChatCompletion };
