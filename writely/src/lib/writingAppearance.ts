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
  serif: "var(--font-newsreader), Georgia, serif",
  sans: "var(--font-archivo), ui-sans-serif, system-ui, sans-serif",
  accessible:
    "var(--font-atkinson-hyperlegible), ui-sans-serif, system-ui, sans-serif",
};

export const writingAppearanceState: {
  currentAppearance: WritingAppearance;
  lastStoredValue: string | null | undefined;
} = {
  currentAppearance: DEFAULT_WRITING_APPEARANCE,
  lastStoredValue: undefined,
};
