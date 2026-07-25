import { describe, expect, it } from "vitest";
import {
  containsUnsupportedPictographs,
  countUnsupportedPictographs,
  documentContainsUnsupportedPictographs,
} from "./writingLanguage";

describe("pictograph validation", () => {
  it("rejects emoji and decorative pictographs", () => {
    expect(containsUnsupportedPictographs("Draft 😀")).toBe(true);
    expect(containsUnsupportedPictographs("Writing ✍️")).toBe(true);
    expect(containsUnsupportedPictographs("Flag 🇸🇬")).toBe(true);
    expect(countUnsupportedPictographs("1️⃣ idea")).toBeGreaterThan(0);
  });

  it("allows supported languages, punctuation, numbers, and useful symbols", () => {
    expect(
      containsUnsupportedPictographs(
        "English 中文 Bahasa Melayu தமிழ் 123 © 2026 — 50% @home",
      ),
    ).toBe(false);
  });

  it("finds unsupported pictographs in editor JSON", () => {
    expect(
      documentContainsUnsupportedPictographs({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "A decorated title 🎨" }],
          },
        ],
      }),
    ).toBe(true);
  });
});
