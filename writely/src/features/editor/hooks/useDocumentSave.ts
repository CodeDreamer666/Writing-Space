"use client";
import type { Editor } from "@tiptap/react";
import getTRPCErrorCode from "./getTRPCErrorCode";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "~/trpc/api";
import type { RouterOutputs } from "~/trpc/routerTypes";
import { MAX_DOCUMENT_TITLE_LENGTH } from "~/lib/documentLimits";
import { DEFAULT_TITLE } from "../utils/editorContent/constants";
import countWords from "../utils/editorContent/countWords";
import isEditorContent from "../utils/editorContent/isEditorContent";
import archiveDiscardedDraft from "../utils/localDraft/archiveDiscardedDraft";
import clearLocalDraft from "../utils/localDraft/clearLocalDraft";
import readLocalDraft from "../utils/localDraft/readLocalDraft";
import serializeDraft from "../utils/localDraft/serializeDraft";
import writeLocalDraft from "../utils/localDraft/writeLocalDraft";

const LOCAL_DRAFT_DELAY_MS = 200;
const SAVE_REQUEST_TIMEOUT_MS = 10_000;

export type SaveStatus =
  | "saved"
  | "saving"
  | "unsaved"
  | "error"
  | "conflict"
  | "recovery";

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

export default function useDocumentSave({
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

    const persisted = writeLocalDraft({
      docId,
      title: titleRef.current,
      content: editor.getJSON(),
      baseVersion: baseVersionRef.current,
      savedAt: new Date().toISOString(),
    });

    // Browser storage is the last line of defence. If it is unavailable the
    // user has to know their writing only exists on the server.
    if (!persisted) {
      setSaveStatus((current) =>
        current === "conflict" || current === "recovery" ? current : "error",
      );
    }
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

    if (saveStatus === "conflict" || saveStatus === "recovery") {
      return;
    }

    setSaveStatus("unsaved");
  }, [docId, editor, saveStatus, scheduleLocalDraft]);

  const saveLatest = useCallback(async () => {
    if (
      !isReadyRef.current ||
      activeDocIdRef.current !== docId ||
      saveStatus === "conflict" ||
      saveStatus === "recovery"
    ) {
      return false;
    }

    if (isSavingRef.current) {
      return false;
    }

    const rawTitle = titleRef.current;
    const normalizedTitle = rawTitle.trim() || DEFAULT_TITLE;
    const content = editor.getJSON();
    const snapshot = serializeDraft(normalizedTitle, content);
    const version = baseVersionRef.current;

    if (normalizedTitle.length > MAX_DOCUMENT_TITLE_LENGTH) {
      dirtyRef.current = true;
      persistCurrentDraft();
      setSaveStatus("error");
      return false;
    }

    if (snapshot === lastSavedSnapshotRef.current) {
      dirtyRef.current = false;
      clearLocalDraft(docId);
      setSaveStatus("saved");
      return true;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");
    let requestTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      const result = await Promise.race([
        saveMutation.mutateAsync({
          docId,
          title: normalizedTitle,
          content,
          version,
        }),
        new Promise<never>((_resolve, reject) => {
          requestTimeout = setTimeout(
            () => reject(new Error("The save request timed out.")),
            SAVE_REQUEST_TIMEOUT_MS,
          );
        }),
      ]);

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
      }

      return true;
    } catch (error) {
      dirtyRef.current = true;
      persistCurrentDraft();

      if (getTRPCErrorCode(error) === "CONFLICT") {
        setSaveStatus("conflict");
      } else {
        setSaveStatus("error");
        onError(error);
      }

      return false;
    } finally {
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }

      isSavingRef.current = false;
    }
  }, [
    docId,
    editor,
    onError,
    persistCurrentDraft,
    saveMutation,
    saveStatus,
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

    editor.commands.setContent(serverContent, { emitUpdate: false });
    titleRef.current = serverTitle;
    baseVersionRef.current = document.version;
    lastSavedSnapshotRef.current = serverSnapshot;
    hydratedDocIdRef.current = docId;
    isReadyRef.current = true;

    dirtyRef.current = false;
    queueMicrotask(() => {
      if (activeDocIdRef.current !== docId) {
        return;
      }

      setTitle(serverTitle);
      onWordCountChange(countWords(editor.getText()));
      setIsHydrated(true);
      setSaveStatus(hasRecoveredChanges ? "recovery" : "saved");
    });
  }, [
    docId,
    document.content,
    document.title,
    document.version,
    editor,
    onWordCountChange,
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

    // Mobile browsers can discard a backgrounded tab without ever firing
    // beforeunload, so persist on every lifecycle signal available.
    const handlePageHide = () => {
      if (dirtyRef.current || isSavingRef.current) {
        persistCurrentDraft();
      }
    };

    const handleVisibilityChange = () => {
      if (
        window.document.visibilityState === "hidden" &&
        (dirtyRef.current || isSavingRef.current)
      ) {
        persistCurrentDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    window.document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      window.document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [persistCurrentDraft]);

  const handleTitleChange = (nextTitle: string) => {
    if (saveStatus === "recovery") {
      return;
    }

    titleRef.current = nextTitle;
    setTitle(nextTitle);
    markDirty();
  };

  const saveDocument = () => saveLatestRef.current();

  const openSavedVersion = () => {
    isDiscardingLocalDraftRef.current = true;
    dirtyRef.current = false;

    if (localDraftTimerRef.current) {
      clearTimeout(localDraftTimerRef.current);
    }

    archiveDiscardedDraft(docId);
    clearLocalDraft(docId);
    window.location.reload();
  };

  const restoreRecovery = () => {
    const localDraft = readLocalDraft(docId);

    if (!localDraft) {
      setSaveStatus("saved");
      return;
    }

    editor.commands.setContent(localDraft.content, { emitUpdate: false });
    titleRef.current = localDraft.title;
    setTitle(localDraft.title);
    onWordCountChange(countWords(editor.getText()));
    baseVersionRef.current = localDraft.baseVersion;
    dirtyRef.current = true;

    if (localDraft.baseVersion === document.version) {
      setSaveStatus("unsaved");
      return;
    }

    setSaveStatus("conflict");
  };

  const discardRecovery = () => {
    archiveDiscardedDraft(docId);
    clearLocalDraft(docId);
    setSaveStatus("saved");
  };

  const getPendingDraft = () => ({
    title: titleRef.current.trim() || DEFAULT_TITLE,
    content: editor.getJSON(),
  });

  return {
    discardRecovery,
    getPendingDraft,
    handleTitleChange,
    isHydrated,
    openSavedVersion,
    restoreRecovery,
    saveDocument,
    saveStatus,
  };
}
