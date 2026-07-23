import type { TRPCError } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import {
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
} from "~/lib/documentLimits";
import type { createTRPCContext } from "~/server/api/trpc";
import { docsRouter, MAX_DOCUMENT_BYTES, MAX_TITLE_LENGTH } from "./docs";

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const userId = "user-1";
const docId = "8d40f4b8-9cf5-4c3f-87d9-66cc74ef535d";
const content = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
};

function createDocumentDatabase() {
  return {
    count: vi.fn<(input: unknown) => Promise<unknown>>(),
    create: vi.fn<(input: unknown) => Promise<unknown>>(),
    findFirst: vi.fn<(input: unknown) => Promise<unknown>>(),
    findMany: vi.fn<(input: unknown) => Promise<unknown>>(),
    updateMany: vi.fn<(input: unknown) => Promise<unknown>>(),
    updateManyAndReturn: vi.fn<(input: unknown) => Promise<unknown>>(),
  };
}

function createCaller(
  documentDatabase: ReturnType<typeof createDocumentDatabase>,
  authenticated = true,
) {
  const context = {
    db: {
      document: documentDatabase,
      $transaction: async (
        callback: (transaction: {
          document: typeof documentDatabase;
          $queryRaw: () => Promise<unknown[]>;
        }) => Promise<unknown>,
      ) =>
        callback({
          document: documentDatabase,
          $queryRaw: vi.fn().mockResolvedValue([]),
        }),
    },
    headers: new Headers(),
    session: authenticated
      ? {
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
        }
      : null,
  } as unknown as Context;

  return docsRouter.createCaller(context);
}

describe("docsRouter authorization", () => {
  it("rejects document access without an authenticated session", async () => {
    const database = createDocumentDatabase();
    const caller = createCaller(database, false);

    await expect(caller.getSelectedDoc({ docId })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(database.findFirst).not.toHaveBeenCalled();
  });

  it("scopes document retrieval to the authenticated owner", async () => {
    const database = createDocumentDatabase();
    database.findFirst.mockResolvedValue({ id: docId, userId });
    const caller = createCaller(database);

    await caller.getSelectedDoc({ docId });

    expect(database.findFirst).toHaveBeenCalledWith({
      where: {
        id: docId,
        userId,
        deletedAt: null,
      },
    });
  });

  it("soft-deletes only a document owned by the authenticated user", async () => {
    const database = createDocumentDatabase();
    database.updateMany.mockResolvedValue({ count: 1 });
    const caller = createCaller(database);

    await caller.deleteDoc({ docId });

    const deleteInput = database.updateMany.mock.calls[0]?.[0];

    expect(deleteInput).toMatchObject({
      where: {
        id: docId,
        userId,
        deletedAt: null,
      },
    });
    const deletedAt = (
      deleteInput as { data?: { deletedAt?: unknown } } | undefined
    )?.data?.deletedAt;
    expect(deletedAt).toBeInstanceOf(Date);
  });

  it("lists only soft-deleted documents owned by the authenticated user", async () => {
    const database = createDocumentDatabase();
    database.findMany.mockResolvedValue([]);
    const caller = createCaller(database);

    await caller.getDeletedDocs();

    expect(database.findMany).toHaveBeenCalledWith({
      where: {
        userId,
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        title: true,
        deletedAt: true,
      },
    });
  });

  it("restores only a soft-deleted document owned by the authenticated user", async () => {
    const database = createDocumentDatabase();
    database.count.mockResolvedValue(3);
    database.updateMany.mockResolvedValue({ count: 1 });
    const caller = createCaller(database);

    await caller.restoreDoc({ docId });

    expect(database.updateMany).toHaveBeenCalledWith({
      where: {
        id: docId,
        userId,
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    });
  });

  it("does not restore a draft when the active document limit is reached", async () => {
    const database = createDocumentDatabase();
    database.count.mockResolvedValue(MAX_DOCUMENTS_PER_USER);
    const caller = createCaller(database);

    await expect(caller.restoreDoc({ docId })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(database.updateMany).not.toHaveBeenCalled();
  });

  it("scopes document exports to the authenticated owner", async () => {
    const database = createDocumentDatabase();
    database.findFirst.mockResolvedValue(null);
    const caller = createCaller(database);

    await expect(
      caller.exportDoc({ docId, format: "txt" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });

    expect(database.findFirst).toHaveBeenCalledWith({
      where: {
        id: docId,
        userId,
        deletedAt: null,
      },
      select: {
        title: true,
        content: true,
      },
    });
  });
});

describe("docsRouter save safety", () => {
  it("enforces the active document limit before creating another document", async () => {
    const database = createDocumentDatabase();
    database.count.mockResolvedValue(MAX_DOCUMENTS_PER_USER);
    const caller = createCaller(database);

    await expect(caller.createDoc()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(database.create).not.toHaveBeenCalled();
  });

  it("updates only the matching owner and document version", async () => {
    const database = createDocumentDatabase();
    const updatedAt = new Date();
    database.updateManyAndReturn.mockResolvedValue([
      { title: "A title", updatedAt, version: 4 },
    ]);
    const caller = createCaller(database);

    await expect(
      caller.saveDoc({
        docId,
        title: "A title",
        content,
        version: 3,
      }),
    ).resolves.toEqual({ title: "A title", updatedAt, version: 4 });

    const saveInput = database.updateManyAndReturn.mock.calls[0]?.[0];

    expect(saveInput).toMatchObject({
      where: {
        id: docId,
        userId,
        deletedAt: null,
        version: 3,
      },
      data: {
        version: { increment: 1 },
      },
    });
  });

  it("reports a conflict instead of overwriting a newer version", async () => {
    const database = createDocumentDatabase();
    database.updateManyAndReturn.mockResolvedValue([]);
    database.findFirst.mockResolvedValue({ id: docId });
    const caller = createCaller(database);

    await expect(
      caller.saveDoc({
        docId,
        title: "A title",
        content,
        version: 2,
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
    } satisfies Partial<TRPCError>);
  });

  it("rejects titles over the server limit", async () => {
    const database = createDocumentDatabase();
    const caller = createCaller(database);

    await expect(
      caller.saveDoc({
        docId,
        title: "x".repeat(MAX_TITLE_LENGTH + 1),
        content,
        version: 0,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(database.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it("rejects document payloads over the server limit", async () => {
    const database = createDocumentDatabase();
    const caller = createCaller(database);
    const oversizedContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "x".repeat(MAX_DOCUMENT_BYTES + 1) }],
        },
      ],
    };

    await expect(
      caller.saveDoc({
        docId,
        title: "A title",
        content: oversizedContent,
        version: 0,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(database.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it("rejects document text over the character limit", async () => {
    const database = createDocumentDatabase();
    const caller = createCaller(database);
    const oversizedContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x".repeat(MAX_DOCUMENT_CHARACTERS + 1),
            },
          ],
        },
      ],
    };

    await expect(
      caller.saveDoc({
        docId,
        title: "A title",
        content: oversizedContent,
        version: 0,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(database.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it("rejects dangerous URL protocols in editor content", async () => {
    const database = createDocumentDatabase();
    const caller = createCaller(database);
    const unsafeContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "unsafe link",
              marks: [
                {
                  type: "link",
                  attrs: { href: "javascript:alert(1)" },
                },
              ],
            },
          ],
        },
      ],
    };

    await expect(
      caller.saveDoc({
        docId,
        title: "A title",
        content: unsafeContent,
        version: 0,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(database.updateManyAndReturn).not.toHaveBeenCalled();
  });
});
