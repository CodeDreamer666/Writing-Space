import { describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect,
}));

import LegacyDocumentPage from "./page";

describe("LegacyDocumentPage", () => {
  it("preserves old document links under the app route", async () => {
    await LegacyDocumentPage({
      params: Promise.resolve({ docId: "document-123" }),
    });

    expect(redirect).toHaveBeenCalledWith("/app/document-123");
  });
});
