import type { JsonInputValue } from "../support";
import { isDeepStrictEqual } from "../support";

export default function hasSameDocumentSnapshot(
  document: { title: string; content: unknown },
  input: { title: string; content: JsonInputValue },
) {
  return (
    document.title === input.title &&
    isDeepStrictEqual(document.content, input.content)
  );
}
