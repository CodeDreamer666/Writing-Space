import { type Editor, EditorContent } from "@tiptap/react";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import { useWritingAppearance } from "~/hooks/useWritingAppearance";
import {
  WRITING_EDITOR_WIDTH_PIXELS,
  WRITING_FONT_FAMILY_VALUES,
  WRITING_LINE_HEIGHTS,
  WRITING_TEXT_SIZE_PIXELS,
} from "~/lib/writingAppearance";
import type { WritingMode } from "~/types/writing";
import type { SaveStatus } from "../hooks/useDocumentAutosave";
import SaveStatusNotice from "./SaveStatusNotice";
import TiptapMenuBar from "./TiptapMenuBar";
import WritingModeSelector from "./WritingModeSelector";

type Props = {
  editor: Editor;
  selectedMode: WritingMode;
  isWritingModeSaving: boolean;
  saveStatus: SaveStatus;
  title: string;
  characterCount: number;
  aiEnabled: boolean;
  isFocusMode: boolean;
  onModeChange: (mode: WritingMode) => void;
  onRetrySave: () => void;
  onOpenSavedVersion: () => void;
  onRestoreRecovery: () => void;
  onDiscardRecovery: () => void;
  onTitleChange: (title: string) => void;
  onAiOpen: () => void;
};

export default function EditorDocument({
  editor,
  selectedMode,
  isWritingModeSaving,
  saveStatus,
  title,
  characterCount,
  aiEnabled,
  isFocusMode,
  onModeChange,
  onRetrySave,
  onOpenSavedVersion,
  onRestoreRecovery,
  onDiscardRecovery,
  onTitleChange,
  onAiOpen,
}: Props) {
  const { locale, t } = useUiLanguage();
  const { appearance } = useWritingAppearance();
  const writingFontFamily = WRITING_FONT_FAMILY_VALUES[appearance.fontFamily];

  return (
    <main
      data-writely-editor
      className={`min-w-0 px-4 sm:px-6 lg:px-8 ${
        isFocusMode ? "py-8 sm:py-14" : "py-6 sm:py-10"
      }`}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: WRITING_EDITOR_WIDTH_PIXELS[appearance.editorWidth],
        }}
      >
        <section
          className={`relative px-5 py-6 transition-all duration-300 sm:px-8 sm:py-8 ${
            isFocusMode
              ? "bg-transparent"
              : "rounded-xl border border-[var(--w-border-soft)] bg-[var(--w-surface)]/70 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
          }`}
        >
          <SaveStatusNotice
            status={saveStatus}
            onRetry={onRetrySave}
            onOpenSavedVersion={onOpenSavedVersion}
            onRestoreRecovery={onRestoreRecovery}
            onDiscardRecovery={onDiscardRecovery}
          />

          <div className="mb-4 flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder={t("editor.untitled")}
                aria-label={t("editor.titleLabel")}
                autoComplete="off"
                maxLength={200}
                disabled={saveStatus === "recovery"}
                className="editor-title-input w-full min-w-0 bg-transparent text-3xl leading-tight font-medium tracking-[-0.02em] text-[var(--w-foreground)] outline-none placeholder:text-[var(--w-placeholder)] sm:text-5xl"
                style={{ fontFamily: writingFontFamily }}
              />
            </div>

            {!isFocusMode && (
              <WritingModeSelector
                selectedMode={selectedMode}
                isSaving={isWritingModeSaving}
                onModeChange={onModeChange}
              />
            )}
          </div>

          <div
            style={{
              fontFamily: writingFontFamily,
              fontSize: WRITING_TEXT_SIZE_PIXELS[appearance.textSize],
              lineHeight: WRITING_LINE_HEIGHTS[appearance.lineSpacing],
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {!isFocusMode && (
            <p
              className={`mt-6 text-right text-xs ${
                characterCount >= 50_000
                  ? "text-[#E2A66F]"
                  : "text-[var(--w-subtle)]"
              }`}
            >
              {t("editor.characters", {
                count: characterCount.toLocaleString(locale),
              })}
            </p>
          )}

          <TiptapMenuBar
            editor={editor}
            aiEnabled={aiEnabled}
            onAiOpen={onAiOpen}
          />
        </section>
      </div>
    </main>
  );
}
