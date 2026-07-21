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
            />,
        );

        expect(markup).toContain(label);
    });

    it("keeps only essential controls in Focus Mode", () => {
        const markup = renderToStaticMarkup(
            <EditorTopBar
                {...handlers}
                saveStatus="saved"
            />,
        );

        expect(markup).toContain("Focus Mode");
        expect(markup).toContain("Exit focus");
        expect(markup).not.toContain("Export");
        expect(markup).not.toContain("New");
    });
});
