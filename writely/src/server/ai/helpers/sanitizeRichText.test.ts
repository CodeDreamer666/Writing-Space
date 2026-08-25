import { expect, test } from "vitest";
import sanitizeRichText from "./sanitizeRichText";

export default function sanitizeRichTextTest() {
  expect(
    sanitizeRichText(
      "<blockquote><strong>Quoted</strong> text</blockquote><script>unsafe</script>",
    ),
  ).toBe("<blockquote><strong>Quoted</strong> text</blockquote>unsafe");
}

test("preserves supported blockquotes while stripping unsafe tags", sanitizeRichTextTest);
