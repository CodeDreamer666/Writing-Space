import { AI_MESSAGE_TOKEN_OVERHEAD } from "../support";

export default function getInputTokenUpperBound(
    systemMessage: string,
    userMessage: string,
) {
    const messageBytes = new TextEncoder().encode(
        `${systemMessage}\n${userMessage}`,
    ).length;

    return Math.ceil(messageBytes / 4) + AI_MESSAGE_TOKEN_OVERHEAD;
}
