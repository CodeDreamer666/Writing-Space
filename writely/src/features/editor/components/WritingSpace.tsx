"use client";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useStatusMessage } from "~/components/layout/StatusMessageProvider";
import Loading from "~/components/shared/Loading";
import ServerError from "~/components/shared/ServerError";
import { MAX_DOCUMENT_CHARACTERS } from "~/lib/documentLimits";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { countUnsupportedPictographs } from "~/lib/writingLanguage";
import { useWritingAppearance } from "~/hooks/useWritingAppearance";
import {
  WRITING_EDITOR_WIDTH_PIXELS,
  WRITING_FONT_FAMILY_VALUES,
  WRITING_LINE_HEIGHTS,
  WRITING_TEXT_SIZE_PIXELS,
} from "~/lib/writingAppearance";
import type { ExportFormat } from "~/server/documents/exportDocument";
import { api, type RouterOutputs } from "~/trpc/react";
import { WRITING_MODES, type WritingMode } from "~/types/writing";
import { useDocumentAutosave } from "../hooks/useDocumentAutosave";
import { DocumentCharacterLimit } from "../extensions/DocumentCharacterLimit";
import { readingTime } from "../utils/editorContent";
import { downloadExport } from "../utils/exportDownload";
import AiWritingPanel from "./AiWritingPanel";
import EditorChrome from "./EditorChrome";
import ExportDialog from "./ExportDialog";
import SaveStatusNotice from "./SaveStatusNotice";
import TiptapMenuBar from "./TiptapMenuBar";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

function isWritingMode(value: string): value is WritingMode {
  return WRITING_MODES.includes(value as WritingMode);
}

function DocumentUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--w-background)] px-6 text-[var(--w-foreground)]">
      <section className="w-full max-w-md text-center">
        <p className="text-xs font-medium tracking-[0.12em] text-[var(--w-subtle)] uppercase">
          Draft unavailable
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight">
          This writing could not be opened.
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--w-muted)]">
          It may have been deleted, or it may belong to another account.
        </p>
        <Link
          href="/app"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--w-foreground)] px-5 text-sm font-medium text-[var(--w-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--w-muted)]"
        >
          Back to drafts
        </Link>
      </section>
    </main>
  );
}

function EditorRuntime({
  docId,
  document,
}: {
  docId: string;
  document: Document;
}) {
  const { showMessage } = useStatusMessage();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start with the sentence you cannot stop thinking about",
      }),
      DocumentCharacterLimit.configure({
        limit: MAX_DOCUMENT_CHARACTERS,
        onLimitExceeded: () => {
          showMessage(
            `A document can contain up to ${MAX_DOCUMENT_CHARACTERS.toLocaleString("en")} characters.`,
            false,
          );
        },
        onUnsupportedPictograph: () => {
          showMessage(
            "Emoji and decorative pictographs are not supported. Use normal punctuation, numbers, or useful symbols instead.",
            false,
          );
        },
      }),
    ],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Draft content",
        class:
          "min-h-[48vh] outline-none text-[var(--w-strong)] transition-colors duration-200 focus:text-[var(--w-foreground)]",
        role: "textbox",
      },
    },
  });

  if (!editor) {
    return <Loading />;
  }

  return <EditorExperience docId={docId} document={document} editor={editor} />;
}

function EditorExperience({
  docId,
  document,
  editor,
}: {
  docId: string;
  document: Document;
  editor: Editor;
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const handleTRPCError = useHandleTRPCError();
  const { showMessage } = useStatusMessage();
  const { appearance } = useWritingAppearance();

  const [title, setTitle] = useState(document.title);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: aiStatus, error: aiStatusError } = api.ai.getStatus.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: true,
    },
  );
  const aiEnabled = aiStatus?.enabled ?? false;
  const aiMessage =
    aiStatus?.message ??
    (aiStatusError
      ? "Writely AI is unavailable right now. You can keep writing and saving normally."
      : "Checking AI availability…");

  const handleSaveError = useCallback(
    (error: unknown) => {
      handleTRPCError({ error, router });
    },
    [handleTRPCError, router],
  );

  const {
    discardRecovery,
    handleTitleChange,
    isHydrated,
    openSavedVersion,
    restoreRecovery,
    savePendingChanges,
    saveStatus,
  } = useDocumentAutosave({
    docId,
    document,
    editor,
    title,
    setTitle,
    onWordCountChange: setWordCount,
    onError: handleSaveError,
  });

  useEffect(() => {
    editor.setEditable(saveStatus !== "recovery");
  }, [editor, saveStatus]);

  useEffect(() => {
    const updateCharacterCount = () => {
      setCharacterCount(editor.state.doc.textContent.length);
    };

    updateCharacterCount();
    editor.on("transaction", updateCharacterCount);

    return () => {
      editor.off("transaction", updateCharacterCount);
    };
  }, [editor]);

  const handleValidatedTitleChange = (nextTitle: string) => {
    if (
      countUnsupportedPictographs(nextTitle) >
      countUnsupportedPictographs(title)
    ) {
      showMessage(
        "Emoji and decorative pictographs are not supported. Use normal punctuation, numbers, or useful symbols instead.",
        false,
      );
      return;
    }

    handleTitleChange(nextTitle);
  };

  const handleOpenExport = () => {
    setIsAiOpen(false);
    setIsMenuOpen(false);
    setIsExportOpen(true);
  };

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      if (saveStatus !== "saved" && !(await savePendingChanges())) {
        return;
      }

      const exportedDocument = await utils.client.docs.exportDoc.query({
        docId,
        format,
      });

      downloadExport(exportedDocument);
      setIsExportOpen(false);
    } catch (error) {
      handleTRPCError({ error, router });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isHydrated) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[var(--w-background)] text-[var(--w-foreground)] transition-colors duration-300">
      <div className="w-full">
        <EditorChrome
          isOpen={isMenuOpen}
          saveStatus={saveStatus}
          title={title}
          wordCount={wordCount}
          characterCount={characterCount}
          readingTime={readingTime(wordCount)}
          isExporting={isExporting}
          onOpen={() => {
            setIsAiOpen(false);
            setIsMenuOpen(true);
          }}
          onClose={() => setIsMenuOpen(false)}
          onTitleChange={handleValidatedTitleChange}
          onExport={handleOpenExport}
        />

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
                onRetry={() => void savePendingChanges()}
                onOpenSavedVersion={openSavedVersion}
                onRestoreRecovery={restoreRecovery}
                onDiscardRecovery={discardRecovery}
              />

              <div
                style={{
                  fontFamily: WRITING_FONT_FAMILY_VALUES[appearance.fontFamily],
                  fontSize: WRITING_TEXT_SIZE_PIXELS[appearance.textSize],
                  lineHeight: WRITING_LINE_HEIGHTS[appearance.lineSpacing],
                }}
              >
                <EditorContent editor={editor} />
              </div>

              <TiptapMenuBar
                editor={editor}
                aiEnabled={aiEnabled}
                onAiOpen={() => {
                  setIsMenuOpen(false);
                  setIsAiOpen(true);
                }}
              />
            </section>
          </div>
        </main>

        <AiWritingPanel
          docId={docId}
          isOpen={isAiOpen}
          editor={editor}
          initialMode={
            isWritingMode(document.writingMode) ? document.writingMode : "Clear"
          }
          aiEnabled={aiEnabled}
          aiMessage={aiMessage}
          remainingTokens={aiStatus?.remainingTokens ?? 0}
          onClose={() => setIsAiOpen(false)}
        />

        <ExportDialog
          isOpen={isExportOpen}
          isExporting={isExporting}
          onClose={() => setIsExportOpen(false)}
          onExport={(format) => {
            void handleExport(format);
          }}
        />
      </div>
    </div>
  );
}

export default function WritingSpace() {
  const params = useParams<{ docId: string }>();
  const router = useRouter();
  const docId = params.docId ?? "";

  const {
    data: document,
    isLoading,
    error,
  } = api.docs.getSelectedDoc.useQuery(
    { docId },
    {
      refetchOnMount: "always",
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      router.replace("/app");
    }
  }, [error, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (error?.data?.code === "NOT_FOUND" || error?.data?.zodError) {
    return <DocumentUnavailable />;
  }

  if (error || !document) {
    return <ServerError />;
  }

  return <EditorRuntime key={docId} docId={docId} document={document} />;
}
