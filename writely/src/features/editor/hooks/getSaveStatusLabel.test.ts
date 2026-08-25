import { expect, test } from "vitest";
import getSaveStatusLabel from "./getSaveStatusLabel";

export default function getSaveStatusLabelTest() {
  expect(getSaveStatusLabel("saved")).toBe("Saved");
  expect(getSaveStatusLabel("error")).toBe("Save failed");
  expect(getSaveStatusLabel("conflict")).toBe("Resolve conflict");
  expect(getSaveStatusLabel("recovery")).toBe("Recovery available");
  expect(getSaveStatusLabel("unsaved")).toBe("Unsaved changes");
  expect(getSaveStatusLabel("saving")).toBe("Saving now…");
}

test("maps every manual save state to its label", getSaveStatusLabelTest);
