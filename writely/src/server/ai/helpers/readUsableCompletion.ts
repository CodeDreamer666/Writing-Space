import type { ChatCompletion } from "../support";

export default function readUsableCompletion(completion: ChatCompletion) {
    const choice = completion.choices[0];
    const promptTokens = completion.usage?.prompt_tokens;
    const completionTokens = completion.usage?.completion_tokens;

    if (
        choice?.finish_reason !== "stop" ||
        !Number.isInteger(promptTokens) ||
        !Number.isInteger(completionTokens) ||
        promptTokens === undefined ||
        completionTokens === undefined ||
        promptTokens < 0 ||
        completionTokens < 0 ||
        promptTokens + completionTokens <= 0
    ) {
        return null;
    }

    return {
        content: choice.message.content ?? null,
        tokensUsed: promptTokens + completionTokens,
    };
}
