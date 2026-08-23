import normalizeWhitespace from "./normalizeWhitespace";
import decodeHtmlEntities from "./decodeHtmlEntities";
import { blockHtmlTagPattern, anyHtmlTagPattern } from "../support";

export default function normalizeRichText(value: string): string {
  const textContent = value
    .replaceAll(blockHtmlTagPattern, " ")
    .replaceAll(anyHtmlTagPattern, "");

  return normalizeWhitespace(decodeHtmlEntities(textContent));
}
