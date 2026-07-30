import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(
  fileURLToPath(new URL("./layout.tsx", import.meta.url)),
  "utf8",
);
const globalStyles = readFileSync(
  fileURLToPath(new URL("../styles/globals.css", import.meta.url)),
  "utf8",
);

describe("responsive application access", () => {
  it("does not render a desktop-only replacement for application content", () => {
    expect(layoutSource).not.toContain("DesktopOnlyNotice");
    expect(layoutSource).not.toContain("desktop-beta-app");
    expect(layoutSource).not.toContain("desktop-beta-locked");
  });

  it("does not hide or viewport-lock the application below 1024px", () => {
    expect(globalStyles).not.toContain(".desktop-beta-notice");
    expect(globalStyles).not.toContain(".desktop-beta-app");
    expect(globalStyles).not.toContain("desktop-beta-locked");
  });
});
