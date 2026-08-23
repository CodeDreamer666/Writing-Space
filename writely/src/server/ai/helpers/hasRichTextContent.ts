import normalizeRichText from "./normalizeRichText";

export default function hasRichTextContent(value: string): boolean {
  return normalizeRichText(value).length > 0;
}
