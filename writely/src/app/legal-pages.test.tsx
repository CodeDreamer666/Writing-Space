import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LegalLinks, SignInLegalNotice } from "~/components/layout/LegalLinks";
import AcceptableUsePage from "./acceptable-use/page";
import DataDeletionPage from "./data-deletion/page";
import PrivacyPageContent from "./privacy/PrivacyPageContent";
import SubprocessorsPage from "./subprocessors/page";
import TermsPage from "./terms/page";

const requiredRoutes = [
  "/privacy",
  "/terms",
  "/acceptable-use",
  "/subprocessors",
  "/data-deletion",
];

describe("public legal pages", () => {
  it.each([
    ["privacy", <PrivacyPageContent key="privacy" />],
    ["terms", <TermsPage key="terms" />],
    ["acceptable use", <AcceptableUsePage key="acceptable-use" />],
    ["subprocessors", <SubprocessorsPage key="subprocessors" />],
    ["data deletion", <DataDeletionPage key="data-deletion" />],
  ])("renders the %s page with a real update date", (_name, page) => {
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Last updated: 27 July 2026");
    expect(html).not.toMatch(/\[[^\]]*(company|address|date|email)[^\]]*\]/i);
    expect(html).not.toContain("Writely Pte. Ltd.");
  });

  it("publishes a direct privacy-contact link", () => {
    const html = renderToStaticMarkup(<PrivacyPageContent />);

    expect(html).toContain('href="mailto:code.dreamer666@gmail.com"');
  });

  it("renders every required footer link", () => {
    const html = renderToStaticMarkup(<LegalLinks />);

    requiredRoutes.forEach((route) => {
      expect(html).toContain(`href="${route}"`);
    });
  });

  it("renders the sign-in agreement notice and every legal link", () => {
    const html = renderToStaticMarkup(<SignInLegalNotice />);

    expect(html).toContain("By continuing, you agree to the");
    expect(html).toContain("Terms of Use");
    expect(html).toContain("Privacy Notice");
    requiredRoutes.forEach((route) => {
      expect(html).toContain(`href="${route}"`);
    });
  });
});
