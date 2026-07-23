import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./LandingNavAction", () => ({
  default: () => <button type="button">Sign in</button>,
}));

vi.mock("./LandingDemos", () => ({
  AiRewriteDemo: () => <div>AI rewrite demo</div>,
  AutosaveDemo: () => <div>Autosave demo</div>,
  EditorPreview: () => <div>Editor preview</div>,
  ExportDemo: () => <div>Export demo</div>,
  FocusModeDemo: () => <div>Focus Mode demo</div>,
}));

import LandingPage from "./page";

describe("LandingPage", () => {
  it("leads with the product promise and a clear path into Writely", () => {
    const markup = renderToStaticMarkup(<LandingPage />);

    expect(markup).toContain("Make room for the");
    expect(markup).toContain("Start a private draft");
    expect(markup).toContain('href="#how-it-works"');
    expect(markup).toContain("AI stays in its place");
  });

  it("keeps the privacy promise specific and avoids invented social proof", () => {
    const markup = renderToStaticMarkup(<LandingPage />);

    expect(markup).toContain("Only this selected passage");
    expect(markup).toContain("no public profile, feed, follower count");
    expect(markup).not.toContain("customers");
    expect(markup).not.toContain("trusted by");
  });
});
