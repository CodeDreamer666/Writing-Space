import { type Editor, EditorContent } from "@tiptap/react";
import { useWritingAppearance } from "~/hooks/useWritingAppearance";
import {
  WRITING_EDITOR_WIDTH_PIXELS,
  WRITING_FONT_FAMILY_VALUES,
  WRITING_LINE_HEIGHTS,
  WRITING_TEXT_SIZE_PIXELS,
} from "~/lib/writingAppearance";
import type { SaveStatus } from "../hooks/useDocumentAutosave";
import SaveStatusNotice from "./SaveStatusNotice";
import TiptapMenuBar from "./TiptapMenuBar";

type Props = {
  editor: Editor;
  saveStatus: SaveStatus;
  aiEnabled: boolean;
  onRetrySave: () => void;
  onOpenSavedVersion: () => void;
  onRestoreRecovery: () => void;
  onDiscardRecovery: () => void;
  onAiOpen: () => void;
};

export default function EditorDocument({
  editor,
  saveStatus,
  aiEnabled,
  onRetrySave,
  onOpenSavedVersion,
  onRestoreRecovery,
  onDiscardRecovery,
  onAiOpen,
}: Props) {
  const { appearance } = useWritingAppearance();
  const writingFontFamily = WRITING_FONT_FAMILY_VALUES[appearance.fontFamily];

  return (
    <main
      data-writely-editor
      className="min-w-0 px-5 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12"
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: WRITING_EDITOR_WIDTH_PIXELS[appearance.editorWidth],
        }}
      >
        <section className="relative">
          <SaveStatusNotice
            status={saveStatus}
            onRetry={onRetrySave}
            onOpenSavedVersion={onOpenSavedVersion}
            onRestoreRecovery={onRestoreRecovery}
            onDiscardRecovery={onDiscardRecovery}
          />

          <div
            style={{
              fontFamily: writingFontFamily,
              fontSize: WRITING_TEXT_SIZE_PIXELS[appearance.textSize],
              lineHeight: WRITING_LINE_HEIGHTS[appearance.lineSpacing],
            }}
          >
            <EditorContent editor={editor} />
          </div>

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
