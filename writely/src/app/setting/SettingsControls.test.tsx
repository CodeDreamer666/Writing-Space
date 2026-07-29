// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    deleteUser: vi.fn(),
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

import {
    AuthenticatedAccount,
    DeleteAccountControl,
    SignOutButton,
} from "./SettingsControls";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.deleteUser.mockResolvedValue({});
    mocks.signOut.mockResolvedValue({});
    mocks.useSession.mockReturnValue({
        data: { user: { id: "user-1" } },
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

describe("account authentication and deletion", () => {
    it("hides authenticated account actions without a session", () => {
        mocks.useSession.mockReturnValue({ data: null });

        act(() =>
            root.render(
                <AuthenticatedAccount>
                    <SignOutButton />
                </AuthenticatedAccount>,
            ),
        );

        expect(container.querySelector("button")).toBeNull();
    });

    it("prevents duplicate sign-out requests", async () => {
        let finishSignOut: (() => void) | undefined;
        mocks.signOut.mockReturnValue(
            new Promise((resolve) => {
                finishSignOut = () => resolve({});
            }),
        );
        act(() => root.render(<SignOutButton />));

        const button = container.querySelector("button");
        if (!button) throw new Error("Sign-out button was not rendered");

        act(() => {
            button.click();
            button.click();
        });

        expect(mocks.signOut).toHaveBeenCalledOnce();

        await act(async () => finishSignOut?.());
        expect(mocks.push).toHaveBeenCalledWith("/");
    });

    it("requires confirmation, prevents duplicate deletion, and clears recovery data", async () => {
        let finishDeletion: (() => void) | undefined;
        mocks.deleteUser.mockReturnValue(
            new Promise((resolve) => {
                finishDeletion = () => resolve({});
            }),
        );
        localStorage.setItem("writely:local-draft:doc-1", "recovery");
        localStorage.setItem("writely:theme", "dark");
        act(() => root.render(<DeleteAccountControl />));

        const deleteButton = container.querySelector("button");
        if (!deleteButton)
            throw new Error("Delete-account button was not rendered");
        act(() => deleteButton.click());

        const confirmButton = Array.from(container.querySelectorAll("button")).find(
            (button) => button.textContent === "Permanently delete account",
        );
        if (!confirmButton)
            throw new Error("Deletion confirmation was not rendered");

        act(() => {
            confirmButton.click();
            confirmButton.click();
        });

        expect(mocks.deleteUser).toHaveBeenCalledOnce();

        await act(async () => finishDeletion?.());
        expect(localStorage.getItem("writely:local-draft:doc-1")).toBeNull();
        expect(localStorage.getItem("writely:theme")).toBe("dark");
        expect(mocks.push).toHaveBeenCalledWith("/");
    });
});
