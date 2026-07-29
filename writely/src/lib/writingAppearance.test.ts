// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_WRITING_APPEARANCE,
  parseWritingAppearance,
  readWritingAppearance,
  storeWritingAppearance,
  WRITING_APPEARANCE_STORAGE_KEY,
  WRITING_EDITOR_WIDTH_PIXELS,
  WRITING_LINE_HEIGHTS,
  WRITING_TEXT_SIZE_PIXELS,
} from "./writingAppearance";

describe("writing appearance preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses the requested editor defaults", () => {
    expect(DEFAULT_WRITING_APPEARANCE).toEqual({
      fontFamily: "serif",
      textSize: "medium",
      lineSpacing: "comfortable",
      editorWidth: "standard",
    });
    expect(WRITING_TEXT_SIZE_PIXELS).toEqual({
      small: 16,
      medium: 18,
      large: 20,
      extraLarge: 22,
    });
    expect(WRITING_LINE_HEIGHTS).toEqual({
      compact: 1.45,
      comfortable: 1.65,
      spacious: 1.85,
    });
    expect(WRITING_EDITOR_WIDTH_PIXELS).toEqual({
      narrow: 600,
      standard: 720,
      wide: 860,
    });
  });

  it("preserves valid fields and replaces invalid stored fields with defaults", () => {
    expect(
      parseWritingAppearance({
        fontFamily: "accessible",
        textSize: "unsupported",
        lineSpacing: "spacious",
        editorWidth: 860,
      }),
    ).toEqual({
      fontFamily: "accessible",
      textSize: "medium",
      lineSpacing: "spacious",
      editorWidth: "standard",
    });
  });

  it("stores and reads the complete appearance preference", () => {
    const appearance = {
      fontFamily: "sans",
      textSize: "extraLarge",
      lineSpacing: "compact",
      editorWidth: "wide",
    } as const;

    storeWritingAppearance(appearance);

    expect(readWritingAppearance()).toEqual(appearance);
    expect(
      JSON.parse(
        localStorage.getItem(WRITING_APPEARANCE_STORAGE_KEY) ?? "null",
      ),
    ).toEqual(appearance);
  });

  it("recovers safely from malformed browser storage", () => {
    localStorage.setItem(WRITING_APPEARANCE_STORAGE_KEY, "{not-json");

    expect(readWritingAppearance()).toEqual(DEFAULT_WRITING_APPEARANCE);
  });
});
