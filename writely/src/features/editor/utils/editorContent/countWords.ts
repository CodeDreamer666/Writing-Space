import { ENGLISH_WORD_PATTERN } from "./constants";

export default function countWords(text: string): number {
  return text.match(ENGLISH_WORD_PATTERN)?.length ?? 0;
}
