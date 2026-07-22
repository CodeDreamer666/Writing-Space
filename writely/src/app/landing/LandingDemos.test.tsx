// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { downloadDemoExport } = vi.hoisted(() => ({
  downloadDemoExport: vi.fn(),
}));

vi.mock("./exportDemoDocument", () => ({ downloadDemoExport }));

import {
  AiRewriteDemo,
  AutosaveDemo,
  EditorPreview,
  ExportDemo,
  FocusModeDemo,
} from "./LandingDemos";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

function getButton(label: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.trim() === label,
  );

  if (!button) {
    throw new Error(`Unable to find the ${label} button`);
  }

  return button;
}

beforeEach(() => {
  downloadDemoExport.mockReset();
  downloadDemoExport.mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("landing page demos", () => {
  it("toggles formatting controls", () => {
    act(() => root.render(<EditorPreview />));

    const boldButton = getButton("Bold");

    act(() => boldButton.click());

    expect(boldButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("switches the selected AI rewrite and explanation", () => {
    act(() => root.render(<AiRewriteDemo />));

    act(() => getButton("Improve clarity").click());

    expect(container.textContent).toContain(
      "We discussed several decisions during the long meeting and clarified the next steps.",
    );
    expect(container.textContent).toContain(
      "Vague wording clarified · next steps made explicit",
    );
  });

  it("enters and exits the Focus Mode demo", () => {
    act(() => root.render(<FocusModeDemo />));

    const focusButton = getButton("Enter Focus Mode");
    act(() => focusButton.click());

    expect(focusButton.getAttribute("aria-pressed")).toBe("true");
    expect(focusButton.textContent).toContain("Exit Focus Mode");

    act(() => focusButton.click());

    expect(focusButton.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows deterministic autosave and recovery states", () => {
    vi.useFakeTimers();
    act(() => root.render(<AutosaveDemo />));

    const field = container.querySelector("textarea");

    if (!field) {
      throw new Error("Unable to find the autosave demo field");
    }

    act(() => {
      const setFieldValue = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.bind(field);

      setFieldValue?.("A changed thought");
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(container.textContent).toContain("Saving…");

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(container.textContent).toContain("Saved");

    act(() => getButton("Try a failed saveKeep recovery copy").click());

    expect(container.textContent).toContain("Recovery copy kept");
  });

  it("downloads each selected export format", async () => {
    act(() => root.render(<ExportDemo />));

    expect(container.querySelector("h2")?.textContent).toBe("Project brief");
    expect(container.querySelector("strong")?.textContent).toBe("Key ideas");
    expect(container.querySelector("em")?.textContent).toBe("your voice");

    for (const [label, format] of [
      ["TXT", "txt"],
      ["Markdown", "md"],
      ["PDF", "pdf"],
      ["Word", "docx"],
    ] as const) {
      await act(async () => {
        getButton(label).click();
      });

      expect(downloadDemoExport).toHaveBeenLastCalledWith(format);
      expect(container.textContent).toContain(`${label} download started`);
    }
  });

  it("shows an export error without losing the selected format", async () => {
    downloadDemoExport.mockRejectedValueOnce(new Error("Download blocked"));
    act(() => root.render(<ExportDemo />));

    await act(async () => {
      getButton("PDF").click();
    });

    expect(getButton("PDF").getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).toContain(
      "PDF export failed. Please try again.",
    );
  });
});
