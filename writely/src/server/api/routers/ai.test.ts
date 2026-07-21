import { afterEach, describe, expect, it, vi } from "vitest";
import type { createTRPCContext } from "~/server/api/trpc";
import { DAILY_AI_TOKEN_LIMIT } from "~/lib/aiLimits";
import { aiRouter } from "./ai";

type ProviderCompletion = {
    choices: Array<{ message: { content: string } }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
    };
};

type UsageUpsertInput = {
    create: {
        userId: string;
        usageDate: Date;
        tokensUsed: number;
    };
    update: {
        tokensUsed: {
            increment: number;
        };
    };
};

const providerCreate = vi.hoisted(() =>
    vi.fn<(input: unknown) => Promise<ProviderCompletion>>(),
);
const envState = vi.hoisted(() => ({ aiEnabled: "true" }));

vi.mock("~/env", () => ({
    env: {
        get AI_ENABLED() {
            return envState.aiEnabled;
        },
        GROQ_API_KEY: "test-key",
    },
}));

vi.mock("~/server/grok", () => ({
    groq: {
        chat: {
            completions: {
                create: providerCreate,
            },
        },
    },
}));

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const userId = "user-1";

function createCaller({
    locked = true,
    tokensUsed = 0,
}: {
    locked?: boolean;
    tokensUsed?: number;
} = {}) {
    const aiDailyUsage = {
        findUnique: vi.fn().mockResolvedValue(
            tokensUsed > 0
                ? {
                    tokensUsed,
                }
                : null,
        ),
        upsert: vi
            .fn<(input: UsageUpsertInput) => Promise<object>>()
            .mockResolvedValue({}),
    };
    const transaction = {
        $queryRaw: vi.fn().mockResolvedValue([{ locked }]),
        aiDailyUsage,
    };
    const database = {
        aiDailyUsage,
        $transaction: vi.fn(
            async (callback: (value: typeof transaction) => Promise<unknown>) =>
                callback(transaction),
        ),
    };
    const context = {
        db: database,
        headers: new Headers(),
        session: {
            session: {
                id: "session-1",
                userId,
                token: "token",
                expiresAt: new Date(Date.now() + 60_000),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            user: {
                id: userId,
                name: "Writer",
                email: "writer@example.com",
                emailVerified: true,
                image: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        },
    } as unknown as Context;

    return {
        caller: aiRouter.createCaller(context),
        aiDailyUsage,
    };
}

describe("aiRouter limits and privacy", () => {
    afterEach(() => {
        envState.aiEnabled = "true";
    });

    it("blocks provider calls when the global AI switch is disabled", async () => {
        providerCreate.mockReset();
        envState.aiEnabled = "false";
        const { caller } = createCaller();

        await expect(
            caller.askAi({
                action: "fixGrammar",
                mode: "Clear",
                selectedText: "A sentence.",
            }),
        ).rejects.toMatchObject({
            code: "FORBIDDEN",
        });
        expect(providerCreate).not.toHaveBeenCalled();
    });

    it("records actual provider usage and sends only the selected text", async () => {
        providerCreate.mockReset();
        providerCreate.mockResolvedValue({
            choices: [{ message: { content: "Clearer sentence." } }],
            usage: {
                prompt_tokens: 120,
                completion_tokens: 30,
            },
        });
        const { caller, aiDailyUsage } = createCaller();

        await expect(
            caller.askAi({
                action: "findWeakPoints",
                mode: "Clear",
                selectedText: "Only this selected sentence.",
            }),
        ).resolves.toMatchObject({
            type: "response",
            remainingTokens: DAILY_AI_TOKEN_LIMIT - 150,
        });

        const providerInput: unknown = providerCreate.mock.calls[0]?.[0];
        expect(JSON.stringify(providerInput)).toContain(
            "Only this selected sentence.",
        );
        const usageInput = aiDailyUsage.upsert.mock.calls[0]?.[0];
        expect(usageInput?.create.userId).toBe(userId);
        expect(usageInput?.create.tokensUsed).toBe(150);
        expect(usageInput?.update.tokensUsed.increment).toBe(150);
    });

    it("rejects a request before the provider call when the allowance is too low", async () => {
        providerCreate.mockReset();
        const { caller } = createCaller({
            tokensUsed: DAILY_AI_TOKEN_LIMIT - 1,
        });

        await expect(
            caller.askAi({
                action: "fixGrammar",
                mode: "Clear",
                selectedText: "A sentence.",
            }),
        ).rejects.toMatchObject({
            code: "TOO_MANY_REQUESTS",
        });
        expect(providerCreate).not.toHaveBeenCalled();
    });

    it("rejects a second active request for the same user", async () => {
        providerCreate.mockReset();
        const { caller } = createCaller({ locked: false });

        await expect(
            caller.askAi({
                action: "fixGrammar",
                mode: "Clear",
                selectedText: "A sentence.",
            }),
        ).rejects.toMatchObject({
            code: "TOO_MANY_REQUESTS",
        });
        expect(providerCreate).not.toHaveBeenCalled();
    });
});
