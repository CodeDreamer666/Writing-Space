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
  onToggleFocus,
  onOpenExport,
  onEscape,
}: Parameters<typeof useWritelyShortcuts>[0]) {
  useWritelyShortcuts({
    onCreateDocument,
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
    const onToggleFocus = vi.fn();
    const onOpenExport = vi.fn();

    act(() => {
      root.render(
        <ShortcutHarness
          onCreateDocument={onCreateDocument}
          onToggleFocus={onToggleFocus}
          onOpenExport={onOpenExport}
        />,
      );
    });

    const createEvent = new KeyboardEvent("keydown", {
      key: "n",
      ctrlKey: true,
      altKey: true,
      cancelable: true,
    });
    const focusEvent = new KeyboardEvent("keydown", {
      key: "F",
      ctrlKey: true,
      altKey: true,
      cancelable: true,
    });
    const exportEvent = new KeyboardEvent("keydown", {
      key: "e",
      metaKey: true,
      altKey: true,
      cancelable: true,
    });

    act(() => {
      window.dispatchEvent(createEvent);
      window.dispatchEvent(focusEvent);
      window.dispatchEvent(exportEvent);
    });

    expect(onCreateDocument).toHaveBeenCalledOnce();
    expect(onToggleFocus).toHaveBeenCalledOnce();
    expect(onOpenExport).toHaveBeenCalledOnce();
    expect(createEvent.defaultPrevented).toBe(true);
    expect(focusEvent.defaultPrevented).toBe(true);
    expect(exportEvent.defaultPrevented).toBe(true);
  });

  it("does not intercept Ctrl or Cmd + S", () => {
    act(() => {
      root.render(<ShortcutHarness />);
    });

    const controlSaveEvent = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      cancelable: true,
    });
    const commandSaveEvent = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      cancelable: true,
    });

    act(() => {
      window.dispatchEvent(controlSaveEvent);
      window.dispatchEvent(commandSaveEvent);
    });

    expect(controlSaveEvent.defaultPrevented).toBe(false);
    expect(commandSaveEvent.defaultPrevented).toBe(false);
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
          altKey: true,
          bubbles: true,
        }),
      );
    });

    expect(onCreateDocument).not.toHaveBeenCalled();
    input.remove();
  });

  it("requires Alt for custom app actions", () => {
    const onCreateDocument = vi.fn();
    const onToggleFocus = vi.fn();
    const onOpenExport = vi.fn();

    act(() => {
      root.render(
        <ShortcutHarness
          onCreateDocument={onCreateDocument}
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
        new KeyboardEvent("keydown", {
          key: "f",
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

    expect(onCreateDocument).not.toHaveBeenCalled();
    expect(onToggleFocus).not.toHaveBeenCalled();
    expect(onOpenExport).not.toHaveBeenCalled();
  });

  it("lets Escape close the active interface", () => {
    const onEscape = vi.fn();

    act(() => {
      root.render(<ShortcutHarness onEscape={onEscape} />);
    });

    const escapeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
    });

    act(() => {
      window.dispatchEvent(escapeEvent);
    });

    expect(onEscape).toHaveBeenCalledOnce();
    expect(escapeEvent.defaultPrevented).toBe(true);
  });
});
