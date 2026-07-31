"use client";
import { useWritingAppearance } from "~/hooks/useWritingAppearance";
import type {
  WritingEditorWidth,
  WritingFontFamily,
  WritingLineSpacing,
  WritingTextSize,
} from "~/lib/writingAppearance";

const controlClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-(--w-border) bg-(--w-surface) px-3 text-sm text-(--w-foreground) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--w-muted)";

export default function WritingAppearanceSettings() {
  const { appearance, updateAppearance } = useWritingAppearance();

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="block">
        <span className="font-medium text-(--w-strong)">Font family</span>
        <select
          value={appearance.fontFamily}
          onChange={(event) =>
            updateAppearance({
              fontFamily: event.target.value as WritingFontFamily,
            })
          }
          className={controlClassName}
        >
          <option value="serif">Serif: Source Serif 4 — Default</option>
          <option value="sans">Sans serif: Inter</option>
          <option value="accessible">Accessible: Atkinson Hyperlegible</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium text-(--w-strong)">Text size</span>
        <select
          value={appearance.textSize}
          onChange={(event) =>
            updateAppearance({
              textSize: event.target.value as WritingTextSize,
            })
          }
          className={controlClassName}
        >
          <option value="small">Small — 16px</option>
          <option value="medium">Medium — 18px — Default</option>
          <option value="large">Large — 20px</option>
          <option value="extraLarge">Extra large — 22px</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium text-(--w-strong)">Line spacing</span>
        <select
          value={appearance.lineSpacing}
          onChange={(event) =>
            updateAppearance({
              lineSpacing: event.target.value as WritingLineSpacing,
            })
          }
          className={controlClassName}
        >
          <option value="compact">Compact — 1.45</option>
          <option value="comfortable">Comfortable — 1.65 — Default</option>
          <option value="spacious">Spacious — 1.85</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium text-(--w-strong)">Editor width</span>
        <select
          value={appearance.editorWidth}
          onChange={(event) =>
            updateAppearance({
              editorWidth: event.target.value as WritingEditorWidth,
            })
          }
          className={controlClassName}
        >
          <option value="narrow">Narrow — approximately 600px</option>
          <option value="standard">
            Standard — approximately 720px — Default
          </option>
          <option value="wide">Wide — approximately 860px</option>
        </select>
      </label>
    </div>
  );
}
