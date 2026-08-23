import escapeHtml from "./escapeHtml";
import { anyHtmlTagPattern, allowedRichTextTagPattern } from "../support";

export default function sanitizeRichText(value: string): string {
  let sanitized = "";
  let lastIndex = 0;

  for (const tag of value.matchAll(anyHtmlTagPattern)) {
    const index = tag.index ?? 0;
    sanitized += escapeHtml(value.slice(lastIndex, index));

    const allowedTag = allowedRichTextTagPattern.exec(tag[0]);

    if (allowedTag) {
      const isClosingTag = allowedTag[1] === "/";
      const tagName = allowedTag[2]?.toLowerCase();

      if (tagName === "br") {
        sanitized += "<br>";
      } else if (tagName) {
        sanitized += `<${isClosingTag ? "/" : ""}${tagName}>`;
      }
    }

    lastIndex = index + tag[0].length;
  }

  return sanitized + escapeHtml(value.slice(lastIndex));
}
