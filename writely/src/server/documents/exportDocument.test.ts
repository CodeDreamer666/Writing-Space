import { describe, expect, it } from "vitest";
import { exportDocumentContent } from "./exportDocument";

describe("exportDocumentContent", () => {
    const content = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "A heading" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "A " },
                    {
                        type: "text",
                        text: "thought",
                        marks: [{ type: "bold" }],
                    },
                ],
            },
        ],
    };

    it("exports readable plain text", () => {
        expect(exportDocumentContent(content, "txt")).toBe(
            "A heading\n\nA thought\n",
        );
    });

    it("preserves basic Markdown formatting", () => {
        expect(exportDocumentContent(content, "md")).toBe(
            "## A heading\n\nA **thought**\n",
        );
    });
});
