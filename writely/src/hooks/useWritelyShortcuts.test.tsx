// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWritelyShortcuts } from "./useWritelyShortcuts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

function ShortcutHarness({
  onCreateDocument,
  onSave,
  onToggleFocus,
  onOpenExport,
  onEscape,
}: Parameters<typeof useWritelyShortcuts>[0]) {
  useWritelyShortcuts({
    onCreateDocument,
    onSave,
    onToggleFocus,
    onOpenExport,
    onEscape,
  });

  return null;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useWritelyShortcuts", () => {
  it("handles Windows and macOS editor shortcuts", () => {
    const onCreateDocument = vi.fn();
    const onSave = vi.fn();
    const onToggleFocus = vi.fn();
    const onOpenExport = vi.fn();

    act(() => {
      root.render(
        <ShortcutHarness
          onCreateDocument={onCreateDocument}
          onSave={onSave}
          onToggleFocus={onToggleFocus}
          onOpenExport={onOpenExport}
        />,
      );
    });

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "n", ctrlKey: true }),
      );
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "s", metaKey: true }),
      );
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "F",
          ctrlKey: true,
          shiftKey: true,
        }),
      );
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "e",
          metaKey: true,
          shiftKey: true,
        }),
      );
    });

    expect(onCreateDocument).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onToggleFocus).toHaveBeenCalledOnce();
    expect(onOpenExport).toHaveBeenCalledOnce();
  });

  it("does not run document shortcuts from unrelated form fields", () => {
    const onCreateDocument = vi.fn();
    const input = document.createElement("input");
    document.body.append(input);

    act(() => {
      root.render(<ShortcutHarness onCreateDocument={onCreateDocument} />);
    });

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "n",
          ctrlKey: true,
          bubbles: true,
        }),
      );
    });

    expect(onCreateDocument).not.toHaveBeenCalled();
    input.remove();
  });

  it("lets Escape close the active interface", () => {
    const onEscape = vi.fn();

    act(() => {
      root.render(<ShortcutHarness onEscape={onEscape} />);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(onEscape).toHaveBeenCalledOnce();
  });
});
