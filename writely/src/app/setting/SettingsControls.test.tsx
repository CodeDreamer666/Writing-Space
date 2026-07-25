// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import { INTERFACE_LANGUAGE_STORAGE_KEY } from "~/lib/writingLanguage";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  showMessage: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("~/components/layout/StatusMessageProvider", () => ({
  useStatusMessage: () => ({ showMessage: mocks.showMessage }),
}));

vi.mock("~/server/better-auth/client", () => ({
  authClient: {
    signOut: mocks.signOut,
    useSession: mocks.useSession,
  },
}));

import {
  AuthenticatedAccount,
  InterfaceLanguageSettings,
  SignOutButton,
} from "./SettingsControls";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function LanguageProbe() {
  const { t } = useUiLanguage();

  return <p>{t("settings.title")}</p>;
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  mocks.push.mockReset();
  mocks.refresh.mockReset();
  mocks.showMessage.mockReset();
  mocks.signOut.mockReset();
  mocks.signOut.mockResolvedValue({});
  mocks.useSession.mockReset();
  mocks.useSession.mockReturnValue({
    data: {
      user: {
        id: "user-1",
      },
    },
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("Settings controls", () => {
  it("stores the selected interface language", () => {
    act(() =>
      root.render(
        <>
          <InterfaceLanguageSettings />
          <LanguageProbe />
        </>,
      ),
    );

    const select = container.querySelector("select");

    if (!select) {
      throw new Error("Unable to find writing-language selection");
    }

    act(() => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )?.set?.bind(select);

      setValue?.("Tamil");
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(localStorage.getItem(INTERFACE_LANGUAGE_STORAGE_KEY)).toBe("Tamil");
    expect(container.textContent).toContain("அமைப்புகள் & உதவி");
    expect(document.documentElement.lang).toBe("ta-SG");
  });

  it("prevents repeated sign-out requests and returns to the landing page", async () => {
    let finishSignOut: ((value: { error?: null }) => void) | undefined;
    mocks.signOut.mockReturnValue(
      new Promise((resolve) => {
        finishSignOut = resolve;
      }),
    );

    act(() => root.render(<SignOutButton />));

    const button = container.querySelector("button");

    if (!button) {
      throw new Error("Unable to find sign-out button");
    }

    act(() => {
      button.click();
      button.click();
    });

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);

    await act(async () => {
      finishSignOut?.({});
    });

    expect(mocks.push).toHaveBeenCalledWith("/landing");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("shows a clear message when sign-out fails", async () => {
    mocks.signOut.mockRejectedValueOnce(new Error("Unavailable"));
    act(() => root.render(<SignOutButton />));

    const button = container.querySelector("button");

    if (!button) {
      throw new Error("Unable to find sign-out button");
    }

    await act(async () => {
      button.click();
    });

    expect(mocks.showMessage).toHaveBeenCalledWith(
      "Unable to sign out. Please try again.",
      false,
    );
    expect(button.disabled).toBe(false);
  });

  it("does not show Sign out without an authenticated session", () => {
    mocks.useSession.mockReturnValue({
      data: null,
    });

    act(() => root.render(<SignOutButton />));

    expect(container.querySelector("button")).toBeNull();
    expect(container.textContent).not.toContain("Sign out");
  });

  it("hides the complete account content without an authenticated session", () => {
    mocks.useSession.mockReturnValue({
      data: null,
    });

    act(() =>
      root.render(
        <AuthenticatedAccount>
          <p>Sign out of Writely on this device.</p>
        </AuthenticatedAccount>,
      ),
    );

    expect(container.textContent).not.toContain(
      "Sign out of Writely on this device.",
    );
  });
});
