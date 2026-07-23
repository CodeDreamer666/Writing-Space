// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  showMessage: vi.fn(),
  signInSocial: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("~/components/layout/StatusMessageProvider", () => ({
  useStatusMessage: () => ({ showMessage: mocks.showMessage }),
}));

vi.mock("~/server/better-auth/client", () => ({
  authClient: {
    signIn: { social: mocks.signInSocial },
    useSession: mocks.useSession,
  },
}));

import LandingNavAction from "./LandingNavAction";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mocks.showMessage.mockReset();
  mocks.signInSocial.mockReset();
  mocks.signInSocial.mockResolvedValue({});
  mocks.useSession.mockReset();
  mocks.useSession.mockReturnValue({ data: null, isPending: false });

  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("LandingNavAction", () => {
  it("starts Google sign-in immediately for logged-out users", async () => {
    act(() => root.render(<LandingNavAction />));

    const button = container.querySelector("button");

    if (!button) {
      throw new Error("Unable to find the sign-in button");
    }

    await act(async () => {
      button.click();
    });

    expect(mocks.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/landing",
    });
  });

  it("keeps the app action for authenticated users", () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: "user_1" } },
      isPending: false,
    });

    act(() => root.render(<LandingNavAction />));

    const link = container.querySelector("a");

    expect(link?.textContent).toBe("Open app");
    expect(link?.getAttribute("href")).toBe("/");
  });

  it("reports an OAuth start failure", async () => {
    mocks.signInSocial.mockRejectedValueOnce(new Error("OAuth unavailable"));
    act(() => root.render(<LandingNavAction />));

    const button = container.querySelector("button");

    if (!button) {
      throw new Error("Unable to find the sign-in button");
    }

    await act(async () => {
      button.click();
    });

    expect(mocks.showMessage).toHaveBeenCalledWith(
      "Unable to start Google sign-in",
      false,
    );
  });
});
