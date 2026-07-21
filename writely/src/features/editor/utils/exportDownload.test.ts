import { describe, expect, it } from "vitest";
import { createExportFilename } from "./exportDownload";

describe("createExportFilename", () => {
  it("removes unsafe filename characters", () => {
    expect(createExportFilename('  Draft: "/\\?*  ', "docx")).toBe(
      "Draft.docx",
    );
  });

  it("uses a safe fallback for an empty title", () => {
    expect(createExportFilename("   ", "pdf")).toBe("Untitled draft.pdf");
  });
});
