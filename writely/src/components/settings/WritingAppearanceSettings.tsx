"use client";
import useWritingAppearance from "~/hooks/useWritingAppearance";
import type {
    WritingEditorWidth,
    WritingFontFamily,
    WritingLineSpacing,
    WritingTextSize,
} from "~/lib/writingAppearance";

const controlClassName =
    "mt-2.5 h-[46px] w-full appearance-none cursor-pointer rounded-none border border-(--w-border) bg-(--w-background) px-3.5 text-sm text-(--w-foreground) outline-none hover:border-(--w-foreground)";

export default function WritingAppearanceSettings() {
    const { appearance, updateAppearance } = useWritingAppearance();

    return (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
                <span className="font-mono-label text-[10px] tracking-[0.16em] text-(--w-subtle) uppercase">
                    Font family
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
                    <option value="serif">Serif: Newsreader — Default</option>
                    <option value="sans">Sans serif: Archivo</option>
                    <option value="accessible">Accessible: Atkinson Hyperlegible</option>
                </select>
            </label>

            <label className="block">
                <span className="font-mono-label text-[10px] tracking-[0.16em] text-(--w-subtle) uppercase">
                    Text size
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
                    <option value="small">Small — 16px</option>
                    <option value="medium">Medium — 18px — Default</option>
                    <option value="large">Large — 20px</option>
                    <option value="extraLarge">Extra large — 22px</option>
                </select>
            </label>

            <label className="block">
                <span className="font-mono-label text-[10px] tracking-[0.16em] text-(--w-subtle) uppercase">
                    Line spacing
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
                    <option value="compact">Compact — 1.45</option>
                    <option value="comfortable">Comfortable — 1.65 — Default</option>
                    <option value="spacious">Spacious — 1.85</option>
                </select>
            </label>

            <label className="block">
                <span className="font-mono-label text-[10px] tracking-[0.16em] text-(--w-subtle) uppercase">
                    Editor width
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
