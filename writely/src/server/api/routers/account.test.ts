import { describe, expect, it, vi } from "vitest";
import type { createTRPCContext } from "~/server/api/trpc";
import { accountRouter } from "./account";

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const userId = "user-1";

function createCaller(authenticated = true) {
  const findUnique = vi.fn();
  const context = {
    db: {
      user: {
        findUnique,
      },
    },
    headers: new Headers(),
    session: authenticated
      ? {
          session: {
            id: "session-1",
            userId,
            token: "private-session-token",
            expiresAt: new Date("2026-08-01T00:00:00.000Z"),
            createdAt: new Date("2026-07-01T00:00:00.000Z"),
            updatedAt: new Date("2026-07-01T00:00:00.000Z"),
          },
          user: {
            id: userId,
            name: "Writer",
            email: "writer@example.com",
            emailVerified: true,
            image: null,
            createdAt: new Date("2026-07-01T00:00:00.000Z"),
            updatedAt: new Date("2026-07-01T00:00:00.000Z"),
          },
        }
      : null,
  } as unknown as Context;

  return {
    caller: accountRouter.createCaller(context),
    findUnique,
  };
}

describe("account data export", () => {
  it("rejects unauthenticated exports", async () => {
    const { caller, findUnique } = createCaller(false);

    await expect(caller.exportData()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("filters the export by the authenticated user and excludes secrets", async () => {
    const { caller, findUnique } = createCaller();
    findUnique.mockResolvedValue({
      id: userId,
      name: "Writer",
      email: "writer@example.com",
      emailVerified: true,
      image: null,
      leaveReminderDisabled: false,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-07-02T00:00:00.000Z"),
      documents: [],
      aiDailyUsage: [],
      feedback: [],
      sessions: [
        {
          id: "session-1",
          expiresAt: new Date("2026-08-01T00:00:00.000Z"),
          createdAt: new Date("2026-07-01T00:00:00.000Z"),
          updatedAt: new Date("2026-07-01T00:00:00.000Z"),
          ipAddress: "127.0.0.1",
          userAgent: "Test browser",
        },
      ],
      accounts: [
        {
          accountId: "google-user-id",
          providerId: "google",
          scope: "openid,email,profile",
          createdAt: new Date("2026-07-01T00:00:00.000Z"),
          updatedAt: new Date("2026-07-01T00:00:00.000Z"),
        },
      ],
    });

    const exportedData = await caller.exportData();

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: userId,
        },
      }),
    );
    expect(exportedData.account.email).toBe("writer@example.com");
    expect(exportedData.connectedAccounts[0]).toMatchObject({
      provider: "google",
      providerAccountId: "google-user-id",
    });
    expect(JSON.stringify(exportedData)).not.toContain("private-session-token");
    expect(JSON.stringify(findUnique.mock.calls[0]?.[0])).not.toContain(
      "accessToken",
    );
    expect(JSON.stringify(findUnique.mock.calls[0]?.[0])).not.toContain(
      "refreshToken",
    );
    expect(JSON.stringify(findUnique.mock.calls[0]?.[0])).not.toContain(
      "idToken",
    );
  });
});
