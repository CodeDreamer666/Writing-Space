import { describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect,
}));

import LegacyLandingPage from "./page";

describe("LegacyLandingPage", () => {
  it("redirects the previous landing URL to the homepage", () => {
    LegacyLandingPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
