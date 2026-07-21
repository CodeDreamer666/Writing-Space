import { describe, expect, it } from "vitest";
import { exportDocumentContent, isDocumentEmpty } from "./exportDocument";
import { exportRichDocument } from "./exportRichDocument";

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

  it("preserves ordered and unordered list structure", () => {
    const listContent = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First" }],
                },
              ],
            },
          ],
        },
        {
          type: "orderedList",
          attrs: { start: 3 },
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Third" }],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(exportDocumentContent(listContent, "md")).toBe(
      "- First\n\n3. Third\n",
    );
  });

  it("detects documents without exportable text", () => {
    expect(
      isDocumentEmpty({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    ).toBe(true);
  });

  it("creates valid PDF and Word containers", async () => {
    const pdf = await exportRichDocument(content, "A title", "pdf");
    const docx = await exportRichDocument(content, "A title", "docx");

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(docx.subarray(0, 2).toString()).toBe("PK");
  });
});
