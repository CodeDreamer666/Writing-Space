// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    readWritingAppearance,
    WRITING_APPEARANCE_STORAGE_KEY,
} from "~/lib/writingAppearance";
import WritingAppearanceSettings from "./WritingAppearanceSettings";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

describe("WritingAppearanceSettings", () => {
    it("shows all editor-only appearance controls with their defaults", () => {
        act(() => root.render(<WritingAppearanceSettings />));

        const selects = Array.from(container.querySelectorAll("select"));

        expect(selects.map((select) => select.value)).toEqual([
            "serif",
            "medium",
            "comfortable",
            "standard",
        ]);
        expect(container.textContent).toContain("Atkinson Hyperlegible");
        expect(container.textContent).toContain("Extra large — 22px");
        expect(container.textContent).toContain("Spacious — 1.85");
        expect(container.textContent).toContain("Wide — approximately 860px");
    });

    it("persists changes without dropping the other appearance choices", () => {
        act(() => root.render(<WritingAppearanceSettings />));

        const selects = Array.from(container.querySelectorAll("select"));
        const fontSelect = selects[0];
        const widthSelect = selects[3];

        if (!fontSelect || !widthSelect) {
            throw new Error("Writing appearance controls were not rendered");
        }

        act(() => {
            fontSelect.value = "accessible";
            fontSelect.dispatchEvent(new Event("change", { bubbles: true }));
            widthSelect.value = "wide";
            widthSelect.dispatchEvent(new Event("change", { bubbles: true }));
        });

        expect(readWritingAppearance()).toMatchObject({
            fontFamily: "accessible",
            editorWidth: "wide",
        });
        expect(localStorage.getItem(WRITING_APPEARANCE_STORAGE_KEY)).not.toBeNull();
    });
});
