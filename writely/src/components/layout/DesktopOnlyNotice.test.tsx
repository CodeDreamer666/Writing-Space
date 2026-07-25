import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DesktopOnlyNotice from "./DesktopOnlyNotice";

describe("DesktopOnlyNotice", () => {
  it("shows the desktop-only beta message and stays hidden on desktop", () => {
    const markup = renderToStaticMarkup(<DesktopOnlyNotice />);

    expect(markup).toContain("Writely beta");
    expect(markup).toContain("Designed for wider screens.");
    expect(markup).toContain("laptops and desktops");
    expect(markup).toContain("desktop-beta-notice");
  });
});
