// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeSelector from "~/components/shared/ThemeSelector";
import { THEME_STORAGE_KEY } from "~/lib/theme";
import ThemeProvider from "./ThemeProvider";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

function mockSystemTheme(prefersDark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = prefersDark;
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: vi.fn(
      (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return {
    change(nextMatches: boolean) {
      matches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches } as MediaQueryListEvent),
      );
    },
  };
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("ThemeProvider", () => {
  it("persists the selected theme", async () => {
    mockSystemTheme(true);

    await act(async () => {
      root.render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>,
      );
    });

    const lightButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Light",
    );

    act(() => lightButton?.click());

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("updates System mode when the operating-system preference changes", async () => {
    const systemTheme = mockSystemTheme(false);

    await act(async () => {
      root.render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>,
      );
    });

    expect(document.documentElement.dataset.theme).toBe("light");

    act(() => systemTheme.change(true));

    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
