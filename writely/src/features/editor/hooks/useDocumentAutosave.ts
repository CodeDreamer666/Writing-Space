"use client";

import { TRPCClientError } from "@trpc/client";
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  countWords,
  DEFAULT_TITLE,
  isEditorContent,
} from "../utils/editorContent";
import {
  canSafelyAutosaveDraft,
  clearLocalDraft,
  readLocalDraft,
  serializeDraft,
  writeLocalDraft,
} from "../utils/localDraft";

const AUTOSAVE_DELAY_MS = 1_200;
const LOCAL_DRAFT_DELAY_MS = 200;

export type SaveStatus = "saved" | "saving" | "unsaved" | "error" | "conflict";

type Document = RouterOutputs["docs"]["getSelectedDoc"];

type Params = {
  docId: string;
  document: Document;
  editor: Editor;
  title: string;
  setTitle: (title: string) => void;
  onWordCountChange: (wordCount: number) => void;
  onError: (error: unknown) => void;
};

function getErrorCode(error: unknown): string | undefined {
  if (!(error instanceof TRPCClientError)) {
    return undefined;
  }

  const data: unknown = error.data;

  if (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    typeof data.code === "string"
  ) {
    return data.code;
  }

  return undefined;
}

export function useDocumentAutosave({
  docId,
  document,
  editor,
  title,
  setTitle,
  onWordCountChange,
  onError,
}: Params) {
  const utils = api.useUtils();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isHydrated, setIsHydrated] = useState(false);
  const activeDocIdRef = useRef(docId);
  const baseVersionRef = useRef(document.version);
  const dirtyRef = useRef(false);
  const isDiscardingLocalDraftRef = useRef(false);
  const hydratedDocIdRef = useRef<string | null>(null);
  const isReadyRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSavedSnapshotRef = useRef("");
  const localDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queuedSaveRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef(title);
  const saveLatestRef = useRef<() => Promise<boolean>>(async () => false);

  const saveMutation = api.docs.saveDoc.useMutation({
    retry: (failureCount, error) => {
      const code = error.data?.code;

      if (
        code === "BAD_REQUEST" ||
        code === "CONFLICT" ||
        code === "FORBIDDEN" ||
        code === "NOT_FOUND" ||
        code === "UNAUTHORIZED"
      ) {
        return false;
      }

      return failureCount < 2;
    },
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 4_000),
  });

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const persistCurrentDraft = useCallback(() => {
    if (
      isDiscardingLocalDraftRef.current ||
      !isReadyRef.current ||
      activeDocIdRef.current !== docId
    ) {
      return;
    }

    writeLocalDraft({
      docId,
      title: titleRef.current,
      content: editor.getJSON(),
      baseVersion: baseVersionRef.current,
      savedAt: new Date().toISOString(),
    });
  }, [docId, editor]);

  const scheduleLocalDraft = useCallback(() => {
    if (localDraftTimerRef.current) {
      clearTimeout(localDraftTimerRef.current);
    }

    localDraftTimerRef.current = setTimeout(
      persistCurrentDraft,
      LOCAL_DRAFT_DELAY_MS,
    );
  }, [persistCurrentDraft]);

  const scheduleSave = useCallback((delay = AUTOSAVE_DELAY_MS) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void saveLatestRef.current();
    }, delay);
  }, []);

  const markDirty = useCallback(() => {
    if (!isReadyRef.current) {
      return;
    }

    const currentSnapshot = serializeDraft(
      titleRef.current.trim() || DEFAULT_TITLE,
      editor.getJSON(),
    );

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      dirtyRef.current = false;

      if (localDraftTimerRef.current) {
        clearTimeout(localDraftTimerRef.current);
      }

      clearLocalDraft(docId);
      setSaveStatus("saved");
      return;
    }

    dirtyRef.current = true;
    scheduleLocalDraft();

    if (saveStatus === "conflict") {
      return;
    }

    setSaveStatus("unsaved");
    scheduleSave();
  }, [docId, editor, saveStatus, scheduleLocalDraft, scheduleSave]);

  const saveLatest = useCallback(async () => {
    if (
      !isReadyRef.current ||
      activeDocIdRef.current !== docId ||
      saveStatus === "conflict"
    ) {
      return false;
    }

    if (isSavingRef.current) {
      queuedSaveRef.current = true;
      return false;
    }

    const rawTitle = titleRef.current;
    const normalizedTitle = rawTitle.trim() || DEFAULT_TITLE;
    const content = editor.getJSON();
    const snapshot = serializeDraft(normalizedTitle, content);
    const version = baseVersionRef.current;

    if (snapshot === lastSavedSnapshotRef.current) {
      dirtyRef.current = false;
      clearLocalDraft(docId);
      setSaveStatus("saved");
      return true;
    }

    isSavingRef.current = true;
    queuedSaveRef.current = false;
    setSaveStatus("saving");

    try {
      const result = await saveMutation.mutateAsync({
        docId,
        title: normalizedTitle,
        content,
        version,
      });

      if (activeDocIdRef.current !== docId) {
        const pendingDraft = readLocalDraft(docId);

        if (pendingDraft?.baseVersion === version) {
          const pendingSnapshot = serializeDraft(
            pendingDraft.title.trim() || DEFAULT_TITLE,
            pendingDraft.content,
          );

          if (pendingSnapshot === snapshot) {
            clearLocalDraft(docId);
          } else {
            writeLocalDraft({
              docId,
              title: pendingDraft.title,
              content: pendingDraft.content,
              baseVersion: result.version,
              savedAt: new Date().toISOString(),
            });
          }
        }

        return true;
      }

      baseVersionRef.current = result.version;
      lastSavedSnapshotRef.current = snapshot;

      if (titleRef.current === rawTitle && rawTitle !== normalizedTitle) {
        titleRef.current = normalizedTitle;
        setTitle(normalizedTitle);
      }

      utils.docs.getSelectedDoc.setData({ docId }, (currentDocument) => {
        if (!currentDocument) {
          return currentDocument;
        }

        return {
          ...currentDocument,
          title: normalizedTitle,
          content,
          updatedAt: result.updatedAt,
          version: result.version,
        };
      });
      void utils.docs.getUserDocs.invalidate();

      const latestSnapshot = serializeDraft(
        titleRef.current.trim() || DEFAULT_TITLE,
        editor.getJSON(),
      );

      if (latestSnapshot === snapshot) {
        dirtyRef.current = false;

        if (localDraftTimerRef.current) {
          clearTimeout(localDraftTimerRef.current);
        }

        clearLocalDraft(docId);
        setSaveStatus("saved");
      } else {
        dirtyRef.current = true;
        persistCurrentDraft();
        setSaveStatus("unsaved");
        queuedSaveRef.current = true;
      }

      return true;
    } catch (error) {
      dirtyRef.current = true;
      persistCurrentDraft();

      if (getErrorCode(error) === "CONFLICT") {
        queuedSaveRef.current = false;
        setSaveStatus("conflict");
      } else {
        setSaveStatus("error");
        onError(error);
      }

      return false;
    } finally {
      isSavingRef.current = false;

      if (queuedSaveRef.current) {
        queuedSaveRef.current = false;
        scheduleSave(0);
      }
    }
  }, [
    docId,
    editor,
    onError,
    persistCurrentDraft,
    saveMutation,
    saveStatus,
    scheduleSave,
    setTitle,
    utils.docs.getSelectedDoc,
    utils.docs.getUserDocs,
  ]);

  useEffect(() => {
    saveLatestRef.current = saveLatest;
  }, [saveLatest]);

  useEffect(() => {
    activeDocIdRef.current = docId;
    isReadyRef.current = hydratedDocIdRef.current === docId;

    return () => {
      if (activeDocIdRef.current === docId) {
        if (dirtyRef.current || isSavingRef.current) {
          persistCurrentDraft();
        }

        activeDocIdRef.current = "";
        isReadyRef.current = false;
      }

      if (localDraftTimerRef.current) {
        clearTimeout(localDraftTimerRef.current);
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [docId, persistCurrentDraft]);

  useEffect(() => {
    if (hydratedDocIdRef.current === docId) {
      return;
    }

    isReadyRef.current = false;
    const serverTitle = document.title.trim() || DEFAULT_TITLE;
    const serverContent = isEditorContent(document.content)
      ? document.content
      : { type: "doc", content: [{ type: "paragraph" }] };
    const localDraft = readLocalDraft(docId);
    const serverSnapshot = serializeDraft(serverTitle, serverContent);
    const localDraftSnapshot = localDraft
      ? serializeDraft(
          localDraft.title.trim() || DEFAULT_TITLE,
          localDraft.content,
        )
      : null;
    const hasRecoveredChanges =
      localDraft !== null && localDraftSnapshot !== serverSnapshot;

    if (localDraft && !hasRecoveredChanges) {
      clearLocalDraft(docId);
    }

    const content =
      hasRecoveredChanges && localDraft ? localDraft.content : serverContent;
    const nextTitle =
      hasRecoveredChanges && localDraft ? localDraft.title : serverTitle;

    editor.commands.setContent(content, { emitUpdate: false });
    titleRef.current = nextTitle;

    baseVersionRef.current =
      hasRecoveredChanges && localDraft
        ? localDraft.baseVersion
        : document.version;
    lastSavedSnapshotRef.current = serverSnapshot;
    hydratedDocIdRef.current = docId;
    isReadyRef.current = true;

    if (!localDraft || !hasRecoveredChanges) {
      dirtyRef.current = false;
      queueMicrotask(() => {
        if (activeDocIdRef.current !== docId) {
          return;
        }

        setTitle(nextTitle);
        onWordCountChange(countWords(editor.getText()));
        setIsHydrated(true);
        setSaveStatus("saved");
      });
      return;
    }

    dirtyRef.current = true;
    const canAutosave = canSafelyAutosaveDraft(localDraft, document.version);

    queueMicrotask(() => {
      if (activeDocIdRef.current !== docId) {
        return;
      }

      setTitle(nextTitle);
      onWordCountChange(countWords(editor.getText()));
      setIsHydrated(true);
      setSaveStatus(canAutosave ? "unsaved" : "conflict");
    });

    if (canAutosave) {
      scheduleSave(0);
    }
  }, [
    docId,
    document.content,
    document.title,
    document.version,
    editor,
    onWordCountChange,
    scheduleSave,
    setTitle,
  ]);

  useEffect(() => {
    const handleEditorUpdate = () => {
      onWordCountChange(countWords(editor.getText()));
      markDirty();
    };

    editor.on("update", handleEditorUpdate);

    return () => {
      editor.off("update", handleEditorUpdate);
    };
  }, [editor, markDirty, onWordCountChange]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDiscardingLocalDraftRef.current) {
        return;
      }

      if (!dirtyRef.current && !isSavingRef.current) {
        return;
      }

      persistCurrentDraft();
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [persistCurrentDraft]);

  const handleTitleChange = (nextTitle: string) => {
    titleRef.current = nextTitle;
    setTitle(nextTitle);
    markDirty();
  };

  const saveNow = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    return saveLatestRef.current();
  };

  const openSavedVersion = () => {
    isDiscardingLocalDraftRef.current = true;
    dirtyRef.current = false;
    queuedSaveRef.current = false;

    if (localDraftTimerRef.current) {
      clearTimeout(localDraftTimerRef.current);
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    clearLocalDraft(docId);
    window.location.reload();
  };

  return {
    handleTitleChange,
    isHydrated,
    openSavedVersion,
    saveNow,
    saveStatus,
  };
}
