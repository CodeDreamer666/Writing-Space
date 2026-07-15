import { type Editor, EditorContent } from "@tiptap/react";
import type { WritingMode } from "~/types/writing";
import { DEFAULT_TITLE } from "../utils/editorContent";
import SaveReminderNotice from "./SaveReminderNotice";
import TiptapMenuBar from "./TiptapMenuBar";
import WritingModeSelector from "./WritingModeSelector";

type Props = {
  editor: Editor;
  selectedMode: WritingMode;
  isWritingModeSaving: boolean;
  isSaveReminderVisible: boolean;
  title: string;
  onModeChange: (mode: WritingMode) => void;
  onDismissSaveReminder: () => void;
  onTitleChange: (title: string) => void;
  onAiOpen: () => void;
};

export default function EditorDocument({
  editor,
  selectedMode,
  isWritingModeSaving,
  isSaveReminderVisible,
  title,
  onModeChange,
  onDismissSaveReminder,
  onTitleChange,
  onAiOpen,
}: Props) {
  return (
    <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section
          className={`relative rounded-xl border border-[#1E2530] bg-[#0F1318]/70 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300 sm:px-8 sm:py-8`}
        >
          {isSaveReminderVisible && (
            <SaveReminderNotice onDismiss={onDismissSaveReminder} />
          )}

          <div className="mb-4 flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder={DEFAULT_TITLE}
                className="w-full min-w-0 bg-transparent text-3xl leading-tight font-medium tracking-[-0.02em] text-[#F5F5F7] outline-none placeholder:text-[#4A5363] sm:text-5xl"
              />
            </div>

            <WritingModeSelector
              selectedMode={selectedMode}
              isSaving={isWritingModeSaving}
              onModeChange={onModeChange}
            />
          </div>

          <EditorContent editor={editor} />

          <TiptapMenuBar editor={editor} onAiOpen={onAiOpen} />
        </section>
      </div>
    </main>
  );
}
