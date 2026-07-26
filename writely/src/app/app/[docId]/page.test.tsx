import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("~/features/editor/components/WritingSpace", () => ({
  default: () => <div>Writing space</div>,
}));

vi.mock("~/server/better-auth/server", () => ({
  getSession: mocks.getSession,
}));

import DocumentPage from "./page";

describe("DocumentPage", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.redirect.mockReset();
  });

  it("sends unauthenticated document visits to the app entry", async () => {
    mocks.getSession.mockResolvedValue(null);

    await DocumentPage();

    expect(mocks.redirect).toHaveBeenCalledWith("/app");
  });

  it("renders the editor for an authenticated user", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });

    const result = await DocumentPage();

    expect(result.type).toBeTypeOf("function");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
