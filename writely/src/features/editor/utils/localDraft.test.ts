// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  canSafelyAutosaveDraft,
  clearAllLocalDrafts,
  type LocalDraft,
} from "./localDraft";

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
  beforeEach(() => {
    localStorage.clear();
  });

  it("allows autosave only when the server version has not changed", () => {
    expect(canSafelyAutosaveDraft(draft, 4)).toBe(true);
    expect(canSafelyAutosaveDraft(draft, 5)).toBe(false);
  });

  it("clears every recovery draft without removing unrelated preferences", () => {
    localStorage.setItem("writely:local-draft:first", "first");
    localStorage.setItem("writely:local-draft:second", "second");
    localStorage.setItem("writely:theme", "dark");

    clearAllLocalDrafts();

    expect(localStorage.getItem("writely:local-draft:first")).toBeNull();
    expect(localStorage.getItem("writely:local-draft:second")).toBeNull();
    expect(localStorage.getItem("writely:theme")).toBe("dark");
  });
});
