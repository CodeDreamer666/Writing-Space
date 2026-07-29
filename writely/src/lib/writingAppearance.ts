export const WRITING_APPEARANCE_STORAGE_KEY = "writely:writing-appearance";
export const WRITING_APPEARANCE_CHANGE_EVENT =
  "writely:writing-appearance-change";

export const WRITING_FONT_FAMILIES = ["serif", "sans", "accessible"] as const;
export const WRITING_TEXT_SIZES = [
  "small",
  "medium",
  "large",
  "extraLarge",
] as const;
export const WRITING_LINE_SPACINGS = [
  "compact",
  "comfortable",
  "spacious",
] as const;
export const WRITING_EDITOR_WIDTHS = ["narrow", "standard", "wide"] as const;

export type WritingFontFamily = (typeof WRITING_FONT_FAMILIES)[number];
export type WritingTextSize = (typeof WRITING_TEXT_SIZES)[number];
export type WritingLineSpacing = (typeof WRITING_LINE_SPACINGS)[number];
export type WritingEditorWidth = (typeof WRITING_EDITOR_WIDTHS)[number];

export type WritingAppearance = {
  fontFamily: WritingFontFamily;
  textSize: WritingTextSize;
  lineSpacing: WritingLineSpacing;
  editorWidth: WritingEditorWidth;
};

export const DEFAULT_WRITING_APPEARANCE: WritingAppearance = {
  fontFamily: "serif",
  textSize: "medium",
  lineSpacing: "comfortable",
  editorWidth: "standard",
};

export const WRITING_TEXT_SIZE_PIXELS: Record<WritingTextSize, number> = {
  small: 16,
  medium: 18,
  large: 20,
  extraLarge: 22,
};

export const WRITING_LINE_HEIGHTS: Record<WritingLineSpacing, number> = {
  compact: 1.45,
  comfortable: 1.65,
  spacious: 1.85,
};

export const WRITING_EDITOR_WIDTH_PIXELS: Record<WritingEditorWidth, number> = {
  narrow: 600,
  standard: 720,
  wide: 860,
};

export const WRITING_FONT_FAMILY_VALUES: Record<WritingFontFamily, string> = {
  serif: "var(--font-source-serif), Georgia, serif",
  sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  accessible:
    "var(--font-atkinson-hyperlegible), ui-sans-serif, system-ui, sans-serif",
};

let currentAppearance = DEFAULT_WRITING_APPEARANCE;
let lastStoredValue: string | null | undefined;

function includesValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function parseWritingAppearance(value: unknown): WritingAppearance {
  if (!value || typeof value !== "object") {
    return DEFAULT_WRITING_APPEARANCE;
  }

  const candidate = value as Partial<WritingAppearance>;

  return {
    fontFamily: includesValue(WRITING_FONT_FAMILIES, candidate.fontFamily)
      ? candidate.fontFamily
      : DEFAULT_WRITING_APPEARANCE.fontFamily,
    textSize: includesValue(WRITING_TEXT_SIZES, candidate.textSize)
      ? candidate.textSize
      : DEFAULT_WRITING_APPEARANCE.textSize,
    lineSpacing: includesValue(WRITING_LINE_SPACINGS, candidate.lineSpacing)
      ? candidate.lineSpacing
      : DEFAULT_WRITING_APPEARANCE.lineSpacing,
    editorWidth: includesValue(WRITING_EDITOR_WIDTHS, candidate.editorWidth)
      ? candidate.editorWidth
      : DEFAULT_WRITING_APPEARANCE.editorWidth,
  };
}

export function readWritingAppearance(): WritingAppearance {
  if (typeof window === "undefined") {
    return DEFAULT_WRITING_APPEARANCE;
  }

  let storedValue: string | null;

  try {
    storedValue = window.localStorage.getItem(WRITING_APPEARANCE_STORAGE_KEY);
  } catch {
    return currentAppearance;
  }

  if (storedValue === lastStoredValue) {
    return currentAppearance;
  }

  lastStoredValue = storedValue;

  if (!storedValue) {
    currentAppearance = DEFAULT_WRITING_APPEARANCE;
    return currentAppearance;
  }

  try {
    currentAppearance = parseWritingAppearance(JSON.parse(storedValue));
  } catch {
    currentAppearance = DEFAULT_WRITING_APPEARANCE;
  }

  return currentAppearance;
}

export function storeWritingAppearance(appearance: WritingAppearance) {
  currentAppearance = appearance;
  lastStoredValue = JSON.stringify(appearance);

  try {
    window.localStorage.setItem(
      WRITING_APPEARANCE_STORAGE_KEY,
      lastStoredValue,
    );
  } catch {
    // The current tab still receives the change event when storage is blocked.
  }

  window.dispatchEvent(new Event(WRITING_APPEARANCE_CHANGE_EVENT));
}
