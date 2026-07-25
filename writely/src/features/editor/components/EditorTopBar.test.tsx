import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import EditorTopBar from "./EditorTopBar";

const handlers = {
  onExport: vi.fn(),
  onToggleFocus: vi.fn(),
};

describe("EditorTopBar", () => {
  it.each([
    ["saving", "Saving now…"],
    ["saved", "Saved"],
    ["error", "Save failed"],
  ] as const)("shows the %s autosave state", (saveStatus, label) => {
    const markup = renderToStaticMarkup(
      <EditorTopBar
        {...handlers}
        saveStatus={saveStatus}
        isFocusMode={false}
        isExporting={false}
      />,
    );

    expect(markup).toContain(label);
  });

  it("keeps only essential controls in Focus Mode", () => {
    const markup = renderToStaticMarkup(
      <EditorTopBar
        {...handlers}
        saveStatus="saved"
        isFocusMode
        isExporting={false}
      />,
    );

    expect(markup).toContain("Exit focus");
    expect(markup).toContain("Saved");
    expect(markup).not.toContain("Export");
    expect(markup).not.toContain("New");
    expect(markup).not.toContain(">Save</button>");
    expect(markup).toContain("bg-[var(--w-surface-raised)]");
    expect(markup).not.toContain("bg-[var(--w-foreground)]");
  });

  it("does not render a manual save control", () => {
    const markup = renderToStaticMarkup(
      <EditorTopBar
        {...handlers}
        saveStatus="saved"
        isFocusMode={false}
        isExporting={false}
      />,
    );

    expect(markup).toContain("Export");
    expect(markup).toContain("Focus");
    expect(markup).not.toContain(">Save</button>");
    expect(markup.match(/<button/g)).toHaveLength(2);
  });
});
