export default function normalizeWhitespace(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}
