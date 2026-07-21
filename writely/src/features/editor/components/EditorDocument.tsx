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
  onModeChange,
  onRetrySave,
  onOpenSavedVersion,
  onRestoreRecovery,
  onDiscardRecovery,
  onTitleChange,
  onAiOpen,
}: Props) {
  return (
    <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section
          className={`relative rounded-xl border border-[#1E2530] bg-[#0F1318]/70 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300 sm:px-8 sm:py-8`}
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
                className="editor-title-input w-full min-w-0 bg-transparent text-3xl leading-tight font-medium tracking-[-0.02em] text-[#F5F5F7] outline-none placeholder:text-[#4A5363] sm:text-5xl"
              />
            </div>

            <WritingModeSelector
              selectedMode={selectedMode}
              isSaving={isWritingModeSaving}
              onModeChange={onModeChange}
            />
          </div>

          <EditorContent editor={editor} />

          <p
            className={`mt-6 text-right text-xs ${
              characterCount >= 50_000 ? "text-[#E2A66F]" : "text-[#596272]"
            }`}
          >
            {characterCount.toLocaleString()} / 50,000 characters
          </p>

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
