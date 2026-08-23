import sanitizeRichText from "./sanitizeRichText";
import hasRichTextContent from "./hasRichTextContent";
import normalizeRichText from "./normalizeRichText";
import {
    z,
    rewriteResponseSchema,
    containsUnsupportedPictographs,
} from "../support";

export default function parseRewriteResponse(
    content: string | null,
): z.infer<typeof rewriteResponseSchema> | null {
    if (!content?.trim()) {
        return null;
    }

    const withoutThinking = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
    const start = withoutThinking.indexOf("{");
    const end = withoutThinking.lastIndexOf("}");

    if (start === -1 || end <= start) {
        return null;
    }

    try {
        const parsed = JSON.parse(
            withoutThinking.slice(start, end + 1),
        ) as unknown;
        const result = rewriteResponseSchema.safeParse(parsed);

        if (!result.success) {
            return null;
        }

        const improved = sanitizeRichText(result.data.improved);

        return hasRichTextContent(improved) &&
            !containsUnsupportedPictographs(normalizeRichText(improved))
            ? { ...result.data, improved }
            : null;
    } catch {
        return null;
    }
}
