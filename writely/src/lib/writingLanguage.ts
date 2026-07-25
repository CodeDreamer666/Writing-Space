import type { JSONContent } from "@tiptap/core";

export const INTERFACE_LANGUAGES = [
  "English",
  "Chinese",
  "Malay",
  "Tamil",
] as const;

export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

export const DEFAULT_INTERFACE_LANGUAGE: InterfaceLanguage = "English";
export const INTERFACE_LANGUAGE_STORAGE_KEY = "writely:writing-language";
export const INTERFACE_LANGUAGE_CHANGE_EVENT =
  "writely:interface-language-change";
export const UNSUPPORTED_PICTOGRAPH_MESSAGE =
  "Emoji and decorative pictographs are not supported. Use normal punctuation, numbers, or useful symbols instead.";

const usefulPictographs = new Set(["©", "®", "™"]);
const pictographPattern =
  /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[0-9#*]\uFE0F?\u20E3)/gu;

export function isInterfaceLanguage(value: string): value is InterfaceLanguage {
  return INTERFACE_LANGUAGES.includes(value as InterfaceLanguage);
}

export function getStoredInterfaceLanguage(): InterfaceLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_INTERFACE_LANGUAGE;
  }

  const storedLanguage = window.localStorage.getItem(
    INTERFACE_LANGUAGE_STORAGE_KEY,
  );

  return storedLanguage && isInterfaceLanguage(storedLanguage)
    ? storedLanguage
    : DEFAULT_INTERFACE_LANGUAGE;
}

export function storeInterfaceLanguage(language: InterfaceLanguage) {
  window.localStorage.setItem(INTERFACE_LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(new Event(INTERFACE_LANGUAGE_CHANGE_EVENT));
}

export function countUnsupportedPictographs(value: string): number {
  return Array.from(value.matchAll(pictographPattern)).filter(
    ([match]) => !usefulPictographs.has(match),
  ).length;
}

export function containsUnsupportedPictographs(value: string): boolean {
  return countUnsupportedPictographs(value) > 0;
}

export function documentContainsUnsupportedPictographs(
  content: JSONContent,
): boolean {
  if (
    content.type === "text" &&
    containsUnsupportedPictographs(content.text ?? "")
  ) {
    return true;
  }

  return (content.content ?? []).some(documentContainsUnsupportedPictographs);
}
