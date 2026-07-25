// @vitest-environment jsdom

import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentCharacterLimit } from "./DocumentCharacterLimit";

let editor: Editor | undefined;

afterEach(() => {
  editor?.destroy();
  editor = undefined;
});

describe("DocumentCharacterLimit composition handling", () => {
  it("allows Chinese and Tamil composition transactions", () => {
    const onUnsupportedPictograph = vi.fn();
    editor = new Editor({
      extensions: [
        StarterKit,
        DocumentCharacterLimit.configure({
          limit: 50_000,
          onLimitExceeded: vi.fn(),
          onUnsupportedPictograph,
        }),
      ],
      content: "<p></p>",
    });

    editor.view.dispatch(
      editor.state.tr.insertText("中文 தமிழ்").setMeta("composition", 1),
    );

    expect(editor.state.doc.textContent).toBe("中文 தமிழ்");
    expect(onUnsupportedPictograph).not.toHaveBeenCalled();
  });

  it("rejects a pictograph transaction and reports it without changing writing", () => {
    const onUnsupportedPictograph = vi.fn();
    editor = new Editor({
      extensions: [
        StarterKit,
        DocumentCharacterLimit.configure({
          limit: 50_000,
          onLimitExceeded: vi.fn(),
          onUnsupportedPictograph,
        }),
      ],
      content: "<p>Keep this text</p>",
    });

    editor.view.dispatch(
      editor.state.tr.insertText("🎨").setMeta("composition", 2),
    );

    expect(editor.state.doc.textContent).toBe("Keep this text");
    expect(onUnsupportedPictograph).toHaveBeenCalledOnce();
  });
});
