import type { JsonInputValue } from "../support";

export default function containsUnsafeUrl(
  value: JsonInputValue | null,
): boolean {
  if (Array.isArray(value)) {
    return value.some(containsUnsafeUrl);
  }

  if (typeof value !== "object" || value === null) {
    return false;
  }

  const href =
    "attrs" in value &&
    typeof value.attrs === "object" &&
    value.attrs !== null &&
    !Array.isArray(value.attrs) &&
    "href" in value.attrs
      ? value.attrs.href
      : undefined;

  if (
    typeof href === "string" &&
    /^\s*(?:data|javascript|vbscript):/i.test(href)
  ) {
    return true;
  }

  return Object.values(value).some((child) =>
    child === undefined ? false : containsUnsafeUrl(child),
  );
}
