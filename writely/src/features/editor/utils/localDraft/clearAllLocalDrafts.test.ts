// @vitest-environment jsdom

import { expect, test } from "vitest";
import clearAllLocalDrafts from "./clearAllLocalDrafts";

export default function clearAllLocalDraftsTest() {
  window.localStorage.clear();
  window.localStorage.setItem("writely:local-draft:one", "active");
  window.localStorage.setItem("writely:discarded-draft:two", "discarded");
  window.localStorage.setItem("writely:preference", "keep");

  clearAllLocalDrafts();

  expect(window.localStorage.getItem("writely:local-draft:one")).toBeNull();
  expect(window.localStorage.getItem("writely:discarded-draft:two")).toBeNull();
  expect(window.localStorage.getItem("writely:preference")).toBe("keep");
}

test("clears active and discarded recovery data only", clearAllLocalDraftsTest);
