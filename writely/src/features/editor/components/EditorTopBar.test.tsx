import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import EditorTopBar from "./EditorTopBar";

const handlers = {
  onBack: vi.fn(),
  onCreate: vi.fn(),
  onExport: vi.fn(),
  onSave: vi.fn(),
  onToggleFocus: vi.fn(),
};

describe("EditorTopBar", () => {
  it.each([
    ["saving", "Saving…"],
    ["saved", "Saved"],
    ["error", "Save failed"],
  ] as const)("shows the %s autosave state", (saveStatus, label) => {
    const markup = renderToStaticMarkup(
      <EditorTopBar
        {...handlers}
        saveStatus={saveStatus}
        isFocusMode={false}
        isCreating={false}
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
        isCreating={false}
        isExporting={false}
      />,
    );

    expect(markup).toContain("Exit focus");
    expect(markup).toContain("Save");
    expect(markup).not.toContain("Export");
    expect(markup).not.toContain("New");
    expect(markup).toContain("bg-[var(--w-surface-raised)]");
    expect(markup).not.toContain("bg-[var(--w-foreground)]");
  });
});
