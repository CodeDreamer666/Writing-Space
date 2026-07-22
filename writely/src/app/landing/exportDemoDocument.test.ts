// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

type DownloadExportInput = {
  title: string;
  content: string;
  encoding: "utf8" | "base64";
  format: "txt" | "md" | "pdf" | "docx";
  mimeType: string;
};

const { downloadExport } = vi.hoisted(() => ({
  downloadExport: vi.fn<(input: DownloadExportInput) => void>(),
}));

vi.mock("~/features/editor/utils/exportDownload", () => ({ downloadExport }));

import { DEMO_EXPORT_TITLE, downloadDemoExport } from "./exportDemoDocument";

afterEach(() => {
  downloadExport.mockReset();
});

describe("downloadDemoExport", () => {
  it("exports the preview content as formatted text and Markdown", async () => {
    await downloadDemoExport("txt");

    expect(downloadExport).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: DEMO_EXPORT_TITLE,
        encoding: "utf8",
        format: "txt",
        content:
          "Project brief\n\nThe draft is ready to share.\n\nKey ideas stay clear; your voice remains.\n",
      }),
    );

    await downloadDemoExport("md");

    expect(downloadExport).toHaveBeenLastCalledWith(
      expect.objectContaining({
        encoding: "utf8",
        format: "md",
        content:
          "## Project brief\n\nThe draft is ready to share.\n\n**Key ideas** stay clear; *your voice* remains.\n",
      }),
    );
  });

  it.each(["pdf", "docx"] as const)(
    "generates a %s file with encoded rich content",
    async (format) => {
      await downloadDemoExport(format);

      expect(downloadExport).toHaveBeenCalledWith(
        expect.objectContaining({
          title: DEMO_EXPORT_TITLE,
          encoding: "base64",
          format,
        }),
      );
      expect(downloadExport.mock.calls[0]?.[0].content.length).toBeGreaterThan(
        100,
      );
    },
  );
});
