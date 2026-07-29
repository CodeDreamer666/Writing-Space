import { describe, expect, it } from "vitest";
import { countWords, readingTime } from "./editorContent";

describe("writing statistics", () => {
  it("counts apostrophes and hyphenated words as single words", () => {
    expect(countWords("Don't stop. Writely’s editor is user-friendly.")).toBe(
      6,
    );
  });

  it("ignores surrounding and repeated whitespace", () => {
    expect(countWords("  One   careful\nthought  ")).toBe(3);
  });

  it("counts text from headings and lists without counting their formatting", () => {
    const editorText = "A clear heading\n\nFirst item\n\nSecond item";

    expect(countWords(editorText)).toBe(7);
  });

  it("counts pasted rich text after the editor removes its markup", () => {
    const pastedEditorText = "Bold ideas and linked sources";

    expect(countWords(pastedEditorText)).toBe(5);
  });

  it("does not count empty paragraphs or punctuation-only content", () => {
    expect(countWords("\n\n   \n\n")).toBe(0);
    expect(countWords("— ... !!!")).toBe(0);
  });

  it("uses approximately 240 English words per reading minute", () => {
    expect(readingTime(0)).toBe("Less than 1 min read");
    expect(readingTime(239)).toBe("Less than 1 min read");
    expect(readingTime(240)).toBe("1 min read");
    expect(readingTime(241)).toBe("2 min read");
    expect(readingTime(480)).toBe("2 min read");
  });
});
