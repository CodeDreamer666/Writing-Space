import includesWritingAppearanceValue from "./includesWritingAppearanceValue";
import {
  DEFAULT_WRITING_APPEARANCE,
  WRITING_EDITOR_WIDTHS,
  WRITING_FONT_FAMILIES,
  WRITING_LINE_SPACINGS,
  WRITING_TEXT_SIZES,
  type WritingAppearance,
} from "./writingAppearance";

export default function parseWritingAppearance(
  value: unknown,
): WritingAppearance {
  if (!value || typeof value !== "object") return DEFAULT_WRITING_APPEARANCE;
  const candidate = value as Partial<WritingAppearance>;
  return {
    fontFamily: includesWritingAppearanceValue(
      WRITING_FONT_FAMILIES,
      candidate.fontFamily,
    )
      ? candidate.fontFamily
      : DEFAULT_WRITING_APPEARANCE.fontFamily,
    textSize: includesWritingAppearanceValue(
      WRITING_TEXT_SIZES,
      candidate.textSize,
    )
      ? candidate.textSize
      : DEFAULT_WRITING_APPEARANCE.textSize,
    lineSpacing: includesWritingAppearanceValue(
      WRITING_LINE_SPACINGS,
      candidate.lineSpacing,
    )
      ? candidate.lineSpacing
      : DEFAULT_WRITING_APPEARANCE.lineSpacing,
    editorWidth: includesWritingAppearanceValue(
      WRITING_EDITOR_WIDTHS,
      candidate.editorWidth,
    )
      ? candidate.editorWidth
      : DEFAULT_WRITING_APPEARANCE.editorWidth,
  };
}
