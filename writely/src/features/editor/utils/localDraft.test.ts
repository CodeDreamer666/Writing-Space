// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canSafelyAutosaveDraft,
  clearAllLocalDrafts,
  cleanupStaleLocalDrafts,
  LOCAL_DRAFT_MAX_AGE_MS,
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows autosave only when the server version has not changed", () => {
    expect(canSafelyAutosaveDraft(draft, 4)).toBe(true);
  });

  it("prevents a recovered draft from overwriting a newer server version", () => {
    expect(canSafelyAutosaveDraft(draft, 5)).toBe(false);
  });

  it("clears every recovery draft without removing unrelated preferences", () => {
    localStorage.setItem("writely:local-draft:first", "first");
    localStorage.setItem("writely:local-draft:second", "second");
    localStorage.setItem("writely:interface-language", "Malay");

    clearAllLocalDrafts();

    expect(localStorage.getItem("writely:local-draft:first")).toBeNull();
    expect(localStorage.getItem("writely:local-draft:second")).toBeNull();
    expect(localStorage.getItem("writely:interface-language")).toBe("Malay");
  });

  it("removes recovery drafts after 30 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T00:00:00.000Z"));
    localStorage.setItem(
      "writely:local-draft:stale",
      JSON.stringify({
        ...draft,
        docId: "stale",
        savedAt: new Date(
          Date.now() - LOCAL_DRAFT_MAX_AGE_MS - 1,
        ).toISOString(),
      }),
    );
    localStorage.setItem(
      "writely:local-draft:current",
      JSON.stringify({
        ...draft,
        docId: "current",
        savedAt: new Date().toISOString(),
      }),
    );

    cleanupStaleLocalDrafts();

    expect(localStorage.getItem("writely:local-draft:stale")).toBeNull();
    expect(localStorage.getItem("writely:local-draft:current")).not.toBeNull();
  });

  it("removes malformed recovery data during cleanup", () => {
    localStorage.setItem("writely:local-draft:malformed", "{not-json");

    cleanupStaleLocalDrafts();

    expect(localStorage.getItem("writely:local-draft:malformed")).toBeNull();
  });
});
