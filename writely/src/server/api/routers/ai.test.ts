import { afterEach, describe, expect, it, vi } from "vitest";
import type { createTRPCContext } from "~/server/api/trpc";
import { DAILY_AI_TOKEN_LIMIT } from "~/lib/aiLimits";
import { aiRouter } from "./ai";

type ProviderCompletion = {
  choices: Array<{
    finish_reason: "stop" | "length";
    message: { content: string };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
};

type UsageUpdateInput = {
  data: {
    tokensUsed: {
      increment: number;
    };
  };
};

type UsageUpsertInput = {
  create: {
    userId: string;
    tokensUsed: number;
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

vi.mock("~/server/db", () => ({
  db: {},
}));

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const userId = "user-1";
const docId = "8d40f4b8-9cf5-4c3f-87d9-66cc74ef535d";

function createCaller({
  locked = true,
  tokensUsed = 0,
}: {
  locked?: boolean;
  tokensUsed?: number;
} = {}) {
  let activeRequestId: string | null = null;
  const aiDailyUsage = {
    findUnique: vi.fn().mockImplementation((input: unknown) => {
      const select = (input as { select?: { requestId?: boolean } }).select;

      if (select?.requestId) {
        return Promise.resolve({ requestId: activeRequestId, tokensUsed });
      }

      return Promise.resolve(tokensUsed > 0 ? { tokensUsed } : null);
    }),
    update: vi
      .fn<(input: UsageUpdateInput) => Promise<object>>()
      .mockResolvedValue({}),
    updateMany: vi.fn().mockImplementation((input: unknown) => {
      const data = (input as { data?: { requestId?: string | null } }).data;

      if (typeof data?.requestId === "string") {
        if (!locked) {
          return Promise.resolve({ count: 0 });
        }

        activeRequestId = data.requestId;
      } else if (data?.requestId === null) {
        activeRequestId = null;
      }

      return Promise.resolve({ count: 1 });
    }),
    upsert: vi
      .fn<(input: UsageUpsertInput) => Promise<object>>()
      .mockResolvedValue({}),
  };
  const database = {
    aiDailyUsage,
    document: {
      findFirst: vi.fn().mockResolvedValue({ id: docId }),
    },
    $transaction: vi.fn(
      async (
        callback: (value: {
          aiDailyUsage: typeof aiDailyUsage;
        }) => Promise<unknown>,
      ) => callback({ aiDailyUsage }),
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
    document: database.document,
    transaction: database.$transaction,
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
        docId,
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
      choices: [
        { finish_reason: "stop", message: { content: "Clearer sentence." } },
      ],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 30,
      },
    });
    const { caller, aiDailyUsage, transaction } = createCaller();

    await expect(
      caller.askAi({
        docId,
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
    const upsertInput = aiDailyUsage.upsert.mock.calls[0]?.[0];
    expect(upsertInput?.create).toMatchObject({ userId, tokensUsed: 0 });
    const usageInput = aiDailyUsage.update.mock.calls[0]?.[0];
    expect(usageInput?.data.tokensUsed.increment).toBe(150);
    expect(providerCreate.mock.invocationCallOrder[0]).toBeLessThan(
      transaction.mock.invocationCallOrder[0]!,
    );
  });

  it("retries a rewrite once when the provider returns invalid JSON", async () => {
    providerCreate.mockReset();
    providerCreate
      .mockResolvedValueOnce({
        choices: [
          {
            finish_reason: "stop",
            message: { content: "Here is a clearer version." },
          },
        ],
        usage: {
          prompt_tokens: 120,
          completion_tokens: 30,
        },
      })
      .mockResolvedValueOnce({
        choices: [
          {
            finish_reason: "stop",
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
        docId,
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
      remainingTokens: DAILY_AI_TOKEN_LIMIT - 170,
    });

    expect(providerCreate).toHaveBeenCalledTimes(2);
    expect(providerCreate.mock.calls[0]?.[0]).not.toHaveProperty(
      "response_format",
    );
    expect(providerCreate.mock.calls[1]?.[0]).not.toHaveProperty(
      "response_format",
    );
    expect(JSON.stringify(providerCreate.mock.calls[1]?.[0])).toContain(
      "previous response was unusable",
    );
    expect(JSON.stringify(providerCreate.mock.calls[0]?.[0])).toContain(
      "<strong>sentence</strong>",
    );

    const usageInput = aiDailyUsage.update.mock.calls[0]?.[0];
    expect(usageInput?.data.tokensUsed.increment).toBe(170);
  });

  it("removes unsafe markup from a valid rewrite before returning it", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [
        {
          finish_reason: "stop",
          message: {
            content:
              '{"improved":"<p onclick=\\"alert(1)\\">A safer <strong>sentence</strong><script>alert(2)</script>.</p>","changes":"The wording is clearer. The structure is simpler. The meaning is preserved."}',
          },
        },
      ],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 40,
      },
    });
    const { caller } = createCaller();

    const response = await caller.askAi({
      docId,
      action: "improveClarity",
      mode: "Clear",
      selectedText: "A sentence.",
      selectedHtml: "<p>A sentence.</p>",
    });

    expect(response).toMatchObject({ type: "rewrite" });

    if (response.type === "rewrite") {
      expect(response.improved).not.toContain("onclick");
      expect(response.improved).not.toContain("<script");
      expect(response.improved).toContain("<strong>sentence</strong>");
    }
  });

  it("does not record usage when rewrite retries do not produce a valid response", async () => {
    providerCreate.mockReset();
    providerCreate
      .mockResolvedValueOnce({
        choices: [{ finish_reason: "stop", message: { content: "Not JSON" } }],
        usage: {
          prompt_tokens: 120,
          completion_tokens: 30,
        },
      })
      .mockResolvedValueOnce({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: '{"improved":"<p>Missing explanation</p>"}',
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
        docId,
        action: "improveClarity",
        mode: "Clear",
        selectedText: "A sentence that needs clarity.",
        selectedHtml: "<p>A sentence that needs clarity.</p>",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(providerCreate).toHaveBeenCalledTimes(2);
    expect(aiDailyUsage.update).not.toHaveBeenCalled();
  });

  it("does not record usage when a non-rewrite response is empty", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [{ finish_reason: "stop", message: { content: "" } }],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 30,
      },
    });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        docId,
        action: "custom",
        mode: "Clear",
        selectedText: "A sentence that needs feedback.",
        selectedHtml: "<p>A sentence that needs feedback.</p>",
        instruction: "Explain this sentence.",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(aiDailyUsage.update).not.toHaveBeenCalled();
  });

  it("accepts selections at the configured character limit", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [
        { finish_reason: "stop", message: { content: "Clearer sentence." } },
      ],
      usage: {
        prompt_tokens: 1_700,
        completion_tokens: 300,
      },
    });
    const { caller } = createCaller();

    await expect(
      caller.askAi({
        docId,
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

  it("scopes AI requests to an active document owned by the user", async () => {
    providerCreate.mockReset();
    const { caller, document } = createCaller();
    document.findFirst.mockResolvedValue(null);

    await expect(
      caller.askAi({
        docId,
        action: "fixGrammar",
        mode: "Clear",
        selectedText: "A sentence.",
        selectedHtml: "<p>A sentence.</p>",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(document.findFirst).toHaveBeenCalledWith({
      where: {
        id: docId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    expect(providerCreate).not.toHaveBeenCalled();
  });

  it("rejects mismatched selected HTML before calling the provider", async () => {
    providerCreate.mockReset();
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        docId,
        action: "fixGrammar",
        mode: "Clear",
        selectedText: "Only this sentence.",
        selectedHtml: "<p>Different text.</p></target>",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(providerCreate).not.toHaveBeenCalled();
    expect(aiDailyUsage.update).not.toHaveBeenCalled();
  });

  it("does not charge responses without provider usage metadata", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [{ finish_reason: "stop", message: { content: "A response." } }],
    });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        docId,
        action: "custom",
        mode: "Clear",
        selectedText: "A sentence.",
        selectedHtml: "<p>A sentence.</p>",
        instruction: "Explain this sentence.",
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    expect(aiDailyUsage.update).not.toHaveBeenCalled();
  });

  it("does not charge truncated provider responses", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [
        {
          finish_reason: "length",
          message: { content: "A partial response" },
        },
      ],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 30,
      },
    });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        docId,
        action: "custom",
        mode: "Clear",
        selectedText: "A sentence.",
        selectedHtml: "<p>A sentence.</p>",
        instruction: "Explain this sentence.",
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    expect(aiDailyUsage.update).not.toHaveBeenCalled();
  });

  it("does not let a final response exceed the daily allowance", async () => {
    providerCreate.mockReset();
    providerCreate.mockResolvedValue({
      choices: [{ finish_reason: "stop", message: { content: "A response." } }],
      usage: {
        prompt_tokens: 4_500,
        completion_tokens: 600,
      },
    });
    const { caller, aiDailyUsage } = createCaller();

    await expect(
      caller.askAi({
        docId,
        action: "custom",
        mode: "Clear",
        selectedText: "A sentence.",
        selectedHtml: "<p>A sentence.</p>",
        instruction: "Explain this sentence.",
      }),
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

    expect(aiDailyUsage.update).not.toHaveBeenCalled();
  });

  it("rejects a request before the provider call when the allowance is too low", async () => {
    providerCreate.mockReset();
    const { caller } = createCaller({
      tokensUsed: DAILY_AI_TOKEN_LIMIT,
    });

    await expect(
      caller.askAi({
        docId,
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
        docId,
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
