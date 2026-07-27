// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import { INTERFACE_LANGUAGE_STORAGE_KEY } from "~/lib/writingLanguage";

const mocks = vi.hoisted(() => ({
  deleteUser: vi.fn(),
  exportData: vi.fn(),
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
    deleteUser: mocks.deleteUser,
    signOut: mocks.signOut,
    useSession: mocks.useSession,
  },
}));

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      client: {
        account: {
          exportData: {
            query: mocks.exportData,
          },
        },
      },
    }),
  },
}));

import {
  AuthenticatedAccount,
  ClearRecoveryDataControl,
  DeleteAccountControl,
  DownloadAccountDataControl,
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
  mocks.deleteUser.mockReset();
  mocks.deleteUser.mockResolvedValue({});
  mocks.exportData.mockReset();
  mocks.exportData.mockResolvedValue({
    account: {
      email: "writer@example.com",
    },
    documents: [],
  });
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
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:writely-export"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
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

    expect(mocks.push).toHaveBeenCalledWith("/");
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

  it("requires confirmation, prevents repeated deletion, and clears recovery copies", async () => {
    let finishDeletion: ((value: { error?: null }) => void) | undefined;
    mocks.deleteUser.mockReturnValue(
      new Promise((resolve) => {
        finishDeletion = resolve;
      }),
    );
    localStorage.setItem("writely:local-draft:doc-1", "recovery");
    localStorage.setItem("writely:interface-language", "English");

    act(() => root.render(<DeleteAccountControl />));

    const initialButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Delete account",
    );

    if (!initialButton) {
      throw new Error("Unable to find delete-account button");
    }

    act(() => initialButton.click());

    const confirmButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Permanently delete account",
    );

    if (!confirmButton) {
      throw new Error("Unable to find account-deletion confirmation");
    }

    act(() => {
      confirmButton.click();
      confirmButton.click();
    });

    expect(mocks.deleteUser).toHaveBeenCalledTimes(1);
    expect(confirmButton.disabled).toBe(true);

    await act(async () => {
      finishDeletion?.({});
    });

    expect(localStorage.getItem("writely:local-draft:doc-1")).toBeNull();
    expect(localStorage.getItem("writely:interface-language")).toBe("English");
    expect(mocks.push).toHaveBeenCalledWith("/");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("keeps the confirmation open and shows a clear deletion error", async () => {
    mocks.deleteUser.mockResolvedValueOnce({
      error: {
        message: "Session is not fresh",
      },
    });

    act(() => root.render(<DeleteAccountControl />));

    const initialButton = container.querySelector("button");

    if (!initialButton) {
      throw new Error("Unable to find delete-account button");
    }

    act(() => initialButton.click());

    const confirmButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Permanently delete account",
    );

    if (!confirmButton) {
      throw new Error("Unable to find account-deletion confirmation");
    }

    await act(async () => {
      confirmButton.click();
    });

    expect(mocks.showMessage).toHaveBeenCalledWith(
      "Unable to delete your account. For security, sign out and sign in again, then retry.",
      false,
    );
    expect(confirmButton.disabled).toBe(false);
    expect(container.getAttribute("role")).toBeNull();
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull();
  });

  it("clears browser recovery data without deleting preferences", () => {
    localStorage.setItem("writely:local-draft:doc-1", "recovery");
    localStorage.setItem("writely:theme", "dark");

    act(() => root.render(<ClearRecoveryDataControl />));
    const button = container.querySelector("button");

    if (!button) {
      throw new Error("Unable to find recovery-data control");
    }

    act(() => button.click());

    expect(localStorage.getItem("writely:local-draft:doc-1")).toBeNull();
    expect(localStorage.getItem("writely:theme")).toBe("dark");
    expect(mocks.showMessage).toHaveBeenCalledWith(
      "Browser recovery copies have been cleared on this device.",
      true,
    );
  });

  it("downloads only the authenticated account export returned by the server", async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    act(() => root.render(<DownloadAccountDataControl />));
    const button = container.querySelector("button");

    if (!button) {
      throw new Error("Unable to find account-export control");
    }

    await act(async () => {
      button.click();
    });

    expect(mocks.exportData).toHaveBeenCalledTimes(1);
    expect(
      (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls,
    ).toHaveLength(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(mocks.showMessage).toHaveBeenCalledWith(
      "Your Writely data export is ready.",
      true,
    );
  });
});
