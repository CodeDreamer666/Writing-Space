// @vitest-environment jsdom

import type { Editor } from "@tiptap/react";
import { StrictMode, useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDocumentAutosave } from "./useDocumentAutosave";
import { readLocalDraft, writeLocalDraft } from "../utils/localDraft";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const trpcMocks = vi.hoisted(() => ({
  invalidateUserDocs: vi.fn(),
  mutateSave: vi.fn(),
  setSelectedDocument: vi.fn(),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      docs: {
        getSelectedDoc: {
          setData: trpcMocks.setSelectedDocument,
        },
        getUserDocs: {
          invalidate: trpcMocks.invalidateUserDocs,
        },
      },
    }),
    docs: {
      saveDoc: {
        useMutation: () => ({
          mutateAsync: trpcMocks.mutateSave,
        }),
      },
    },
  },
}));

const docId = "8d40f4b8-9cf5-4c3f-87d9-66cc74ef535d";
const emptyContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function createEditor(): Editor {
  let content = emptyContent;

  return {
    commands: {
      setContent: (nextContent: typeof emptyContent) => {
        content = nextContent;
        return true;
      },
    },
    getJSON: () => content,
    getText: () => "",
    on: vi.fn(),
    off: vi.fn(),
  } as unknown as Editor;
}

describe("useDocumentAutosave", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    trpcMocks.invalidateUserDocs.mockReset();
    trpcMocks.mutateSave.mockReset();
    trpcMocks.setSelectedDocument.mockReset();
    trpcMocks.mutateSave.mockImplementation(
      async (input: { title: string; version: number }) => ({
        title: input.title,
        updatedAt: new Date(),
        version: input.version + 1,
      }),
    );

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("keeps autosave and pending-change flushing active after Strict Mode replays effects", async () => {
    const editor = createEditor();
    let autosave: ReturnType<typeof useDocumentAutosave> | null = null;

    function Harness() {
      const [title, setTitle] = useState("New Draft");

      autosave = useDocumentAutosave({
        docId,
        document: {
          id: docId,
          userId: "user-1",
          title: "New Draft",
          content: emptyContent,
          writingMode: "Clear",
          version: 0,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        editor,
        title,
        setTitle,
        onWordCountChange: vi.fn(),
        onError: vi.fn(),
      });

      return null;
    }

    await act(async () => {
      root.render(
        <StrictMode>
          <Harness />
        </StrictMode>,
      );
    });

    if (!autosave) {
      throw new Error("Autosave hook did not render");
    }

    act(() => {
      autosave?.handleTitleChange("Autosaved title");
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1_300));
    });

    expect(trpcMocks.mutateSave).toHaveBeenCalledTimes(1);
    expect(trpcMocks.mutateSave).toHaveBeenLastCalledWith(
      expect.objectContaining({
        docId,
        title: "Autosaved title",
        version: 0,
      }),
    );

    act(() => {
      autosave?.handleTitleChange("Pending title");
    });

    await act(async () => {
      await autosave?.savePendingChanges();
    });

    expect(trpcMocks.mutateSave).toHaveBeenCalledTimes(2);
    expect(trpcMocks.mutateSave).toHaveBeenLastCalledWith(
      expect.objectContaining({
        docId,
        title: "Pending title",
        version: 1,
      }),
    );
  });

  it("clears a stale recovered draft when it matches the saved document", async () => {
    const editor = createEditor();

    writeLocalDraft({
      docId,
      title: "Saved Draft",
      content: emptyContent,
      baseVersion: 0,
      savedAt: new Date().toISOString(),
    });

    function Harness() {
      const [title, setTitle] = useState("Saved Draft");

      useDocumentAutosave({
        docId,
        document: {
          id: docId,
          userId: "user-1",
          title: "Saved Draft",
          content: emptyContent,
          writingMode: "Clear",
          version: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        editor,
        title,
        setTitle,
        onWordCountChange: vi.fn(),
        onError: vi.fn(),
      });

      return null;
    }

    await act(async () => {
      root.render(<Harness />);
    });

    expect(readLocalDraft(docId)).toBeNull();
  });

  it("offers a recovery copy without silently replacing saved content", async () => {
    const editor = createEditor();
    let autosave: ReturnType<typeof useDocumentAutosave> | null = null;
    let observedStatus = "";
    const recoveredContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Recovered writing" }],
        },
      ],
    };

    writeLocalDraft({
      docId,
      title: "Recovered Draft",
      content: recoveredContent,
      baseVersion: 0,
      savedAt: new Date().toISOString(),
    });

    function Harness() {
      const [title, setTitle] = useState("Saved Draft");

      autosave = useDocumentAutosave({
        docId,
        document: {
          id: docId,
          userId: "user-1",
          title: "Saved Draft",
          content: emptyContent,
          writingMode: "Clear",
          version: 0,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        editor,
        title,
        setTitle,
        onWordCountChange: vi.fn(),
        onError: vi.fn(),
      });
      observedStatus = autosave.saveStatus;

      return null;
    }

    await act(async () => {
      root.render(<Harness />);
    });

    expect(observedStatus).toBe("recovery");
    expect(editor.getJSON()).toEqual(emptyContent);
    expect(readLocalDraft(docId)?.content).toEqual(recoveredContent);
  });

  it("does not restore a discarded recovered draft during unmount", async () => {
    const editor = createEditor();
    let autosave: ReturnType<typeof useDocumentAutosave> | null = null;
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    writeLocalDraft({
      docId,
      title: "Recovered Draft",
      content: emptyContent,
      baseVersion: 0,
      savedAt: new Date().toISOString(),
    });

    function Harness() {
      const [title, setTitle] = useState("Saved Draft");

      autosave = useDocumentAutosave({
        docId,
        document: {
          id: docId,
          userId: "user-1",
          title: "Saved Draft",
          content: emptyContent,
          writingMode: "Clear",
          version: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        editor,
        title,
        setTitle,
        onWordCountChange: vi.fn(),
        onError: vi.fn(),
      });

      return null;
    }

    await act(async () => {
      root.render(<Harness />);
    });

    act(() => {
      autosave?.openSavedVersion();
    });

    await act(async () => {
      root.unmount();
    });

    expect(readLocalDraft(docId)).toBeNull();
    consoleErrorSpy.mockRestore();
  });
});
