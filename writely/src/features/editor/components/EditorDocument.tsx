import { type Editor, EditorContent } from "@tiptap/react";
import type { WritingMode } from "~/types/writing";
import type { SaveStatus } from "../hooks/useDocumentAutosave";
import { DEFAULT_TITLE } from "../utils/editorContent";
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
  return (
    <main
      data-writely-editor
      className={`min-w-0 px-4 sm:px-6 lg:px-8 ${
        isFocusMode ? "py-8 sm:py-14" : "py-6 sm:py-10"
      }`}
    >
      <div className="mx-auto max-w-3xl">
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
                placeholder={DEFAULT_TITLE}
                aria-label="Draft title"
                autoComplete="off"
                maxLength={200}
                disabled={saveStatus === "recovery"}
                className="editor-title-input w-full min-w-0 bg-transparent text-3xl leading-tight font-medium tracking-[-0.02em] text-[var(--w-foreground)] outline-none placeholder:text-[var(--w-placeholder)] sm:text-5xl"
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

          <EditorContent editor={editor} />

          {!isFocusMode && (
            <p
              className={`mt-6 text-right text-xs ${
                characterCount >= 50_000
                  ? "text-[#E2A66F]"
                  : "text-[var(--w-subtle)]"
              }`}
            >
              {characterCount.toLocaleString()} / 50,000 characters
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
