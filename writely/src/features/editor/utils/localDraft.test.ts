import { describe, expect, it } from "vitest";
import { canSafelyAutosaveDraft, type LocalDraft } from "./localDraft";

const draft: LocalDraft = {
  schemaVersion: 1,
  docId: "8d40f4b8-9cf5-4c3f-87d9-66cc74ef535d",
  title: "Recovered thought",
  content: {
    type: "doc",
    content: [{ type: "paragraph" }],
  },
  baseVersion: 4,
  savedAt: "2026-07-15T12:00:00.000Z",
};

describe("local draft recovery", () => {
  it("allows autosave only when the server version has not changed", () => {
    expect(canSafelyAutosaveDraft(draft, 4)).toBe(true);
  });

  it("prevents a recovered draft from overwriting a newer server version", () => {
    expect(canSafelyAutosaveDraft(draft, 5)).toBe(false);
  });
});
