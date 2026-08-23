import normalizeWhitespace from "./normalizeWhitespace";

export default function normalizePlainText(value: string): string {
  return normalizeWhitespace(value);
}
