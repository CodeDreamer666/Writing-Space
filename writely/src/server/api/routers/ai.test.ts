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
        selectedHtml: "<p>A sentence.</p>",
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
        action: "custom",
        mode: "Clear",
        selectedText: "Only this selected sentence.",
        selectedHtml: "<p>Only this selected sentence.</p>",
        instruction: "Explain this sentence.",
      }),
    ).resolves.toMatchObject({
      type: "response",
      remainingTokens: DAILY_AI_TOKEN_LIMIT - 150,
    });

    const providerInput: unknown = providerCreate.mock.calls[0]?.[0];
    expect(JSON.stringify(providerInput)).toContain(
      "Only this selected sentence.",
    );
    expect(providerInput).toMatchObject({ max_tokens: 2_500 });
    const usageInput = aiDailyUsage.upsert.mock.calls[0]?.[0];
    expect(usageInput?.create.userId).toBe(userId);
    expect(usageInput?.create.tokensUsed).toBe(150);
    expect(usageInput?.update.tokensUsed.increment).toBe(150);
  });

  it("retries a rewrite once when the provider returns invalid JSON", async () => {
    providerCreate.mockReset();
    providerCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: "Here is a clearer version." } }],
        usage: {
          prompt_tokens: 120,
          completion_tokens: 30,
        },
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                '{"improved":"<h2>Clearer version</h2><p>A <strong>clearer</strong> sentence.</p><ul><li>Keep it concise.</li></ul>","changes":"The wording is more direct. The sentence is easier to scan. The original meaning is unchanged."}',
            },
          },
        ],
        usage: {
          prompt_tokens: 130,
          completion_tokens: 40,
        },
      });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        action: "improveClarity",
        mode: "Clear",
        selectedText: "A sentence that needs clarity.",
        selectedHtml: "<p>A <strong>sentence</strong> that needs clarity.</p>",
      }),
    ).resolves.toMatchObject({
      type: "rewrite",
      improved:
        "<h2>Clearer version</h2><p>A <strong>clearer</strong> sentence.</p><ul><li>Keep it concise.</li></ul>",
      changes:
        "The wording is more direct. The sentence is easier to scan. The original meaning is unchanged.",
      remainingTokens: DAILY_AI_TOKEN_LIMIT - 320,
    });

    expect(providerCreate).toHaveBeenCalledTimes(2);
    expect(providerCreate.mock.calls[0]?.[0]).not.toHaveProperty(
      "response_format",
    );
    expect(providerCreate.mock.calls[1]?.[0]).not.toHaveProperty(
      "response_format",
    );
    expect(JSON.stringify(providerCreate.mock.calls[1]?.[0])).toContain(
      "previous response was not valid",
    );
    expect(JSON.stringify(providerCreate.mock.calls[0]?.[0])).toContain(
      "<strong>sentence</strong>",
    );

    const usageInput = aiDailyUsage.upsert.mock.calls[0]?.[0];
    expect(usageInput?.create.tokensUsed).toBe(320);
    expect(usageInput?.update.tokensUsed.increment).toBe(320);
  });

  it("does not record usage when rewrite retries do not produce a valid response", async () => {
    providerCreate.mockReset();
    providerCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: "Not JSON" } }],
        usage: {
          prompt_tokens: 120,
          completion_tokens: 30,
        },
      })
      .mockResolvedValueOnce({
        choices: [
          { message: { content: '{"improved":"<p>Missing explanation</p>"}' } },
        ],
        usage: {
          prompt_tokens: 130,
          completion_tokens: 40,
        },
      });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        action: "improveClarity",
        mode: "Clear",
        selectedText: "A sentence that needs clarity.",
        selectedHtml: "<p>A sentence that needs clarity.</p>",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(providerCreate).toHaveBeenCalledTimes(2);
    expect(aiDailyUsage.upsert).not.toHaveBeenCalled();
  });

  it("does not record usage when a non-rewrite response is empty", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [{ message: { content: "" } }],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 30,
      },
    });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        action: "custom",
        mode: "Clear",
        selectedText: "A sentence that needs feedback.",
        selectedHtml: "<p>A sentence that needs feedback.</p>",
        instruction: "Explain this sentence.",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(aiDailyUsage.upsert).not.toHaveBeenCalled();
  });

  it("accepts selections at the configured character limit", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [{ message: { content: "Clearer sentence." } }],
      usage: {
        prompt_tokens: 1_700,
        completion_tokens: 300,
      },
    });
    const { caller } = createCaller();

    await expect(
      caller.askAi({
        action: "custom",
        mode: "Clear",
        selectedText: "A".repeat(1_000),
        selectedHtml: `<p>${"A".repeat(1_000)}</p>`,
        instruction: "Explain this selection.",
      }),
    ).resolves.toMatchObject({
      remainingTokens: DAILY_AI_TOKEN_LIMIT - 2_000,
    });

    const providerInput: unknown = providerCreate.mock.calls[0]?.[0];
    expect(providerInput).toMatchObject({ max_tokens: 2_500 });
  });

  it("rejects a request before the provider call when the allowance is too low", async () => {
    providerCreate.mockReset();
    const { caller } = createCaller({
      tokensUsed: DAILY_AI_TOKEN_LIMIT,
    });

    await expect(
      caller.askAi({
        action: "fixGrammar",
        mode: "Clear",
        selectedText: "A sentence.",
        selectedHtml: "<p>A sentence.</p>",
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
        selectedHtml: "<p>A sentence.</p>",
      }),
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    expect(providerCreate).not.toHaveBeenCalled();
  });
});
