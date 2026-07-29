"use client";

import { useWritingAppearance } from "~/hooks/useWritingAppearance";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import type {
  WritingEditorWidth,
  WritingFontFamily,
  WritingLineSpacing,
  WritingTextSize,
} from "~/lib/writingAppearance";

const controlClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--w-border)] bg-[var(--w-surface)] px-3 text-sm text-[var(--w-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]";

export default function WritingAppearanceSettings() {
  const { t } = useUiLanguage();
  const { appearance, updateAppearance } = useWritingAppearance();

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="block">
        <span className="font-medium text-[var(--w-strong)]">
          {t("settings.writingFont")}
        </span>
        <select
          value={appearance.fontFamily}
          onChange={(event) =>
            updateAppearance({
              fontFamily: event.target.value as WritingFontFamily,
            })
          }
          className={controlClassName}
        >
          <option value="serif">{t("settings.fontSerif")}</option>
          <option value="sans">{t("settings.fontSans")}</option>
          <option value="accessible">{t("settings.fontAccessible")}</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium text-[var(--w-strong)]">
          {t("settings.writingTextSize")}
        </span>
        <select
          value={appearance.textSize}
          onChange={(event) =>
            updateAppearance({
              textSize: event.target.value as WritingTextSize,
            })
          }
          className={controlClassName}
        >
          <option value="small">{t("settings.textSmall")}</option>
          <option value="medium">{t("settings.textMedium")}</option>
          <option value="large">{t("settings.textLarge")}</option>
          <option value="extraLarge">{t("settings.textExtraLarge")}</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium text-[var(--w-strong)]">
          {t("settings.writingLineSpacing")}
        </span>
        <select
          value={appearance.lineSpacing}
          onChange={(event) =>
            updateAppearance({
              lineSpacing: event.target.value as WritingLineSpacing,
            })
          }
          className={controlClassName}
        >
          <option value="compact">{t("settings.spacingCompact")}</option>
          <option value="comfortable">
            {t("settings.spacingComfortable")}
          </option>
          <option value="spacious">{t("settings.spacingSpacious")}</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium text-[var(--w-strong)]">
          {t("settings.writingEditorWidth")}
        </span>
        <select
          value={appearance.editorWidth}
          onChange={(event) =>
            updateAppearance({
              editorWidth: event.target.value as WritingEditorWidth,
            })
          }
          className={controlClassName}
        >
          <option value="narrow">{t("settings.widthNarrow")}</option>
          <option value="standard">{t("settings.widthStandard")}</option>
          <option value="wide">{t("settings.widthWide")}</option>
        </select>
      </label>
    </div>
  );
}
