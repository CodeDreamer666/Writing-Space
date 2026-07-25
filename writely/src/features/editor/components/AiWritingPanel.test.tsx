// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INTERFACE_LANGUAGE_STORAGE_KEY } from "~/lib/writingLanguage";
import AiWritingPanel from "./AiWritingPanel";

type MockMutationError = {
  message: string;
  data?: {
    zodError?: unknown;
  };
};

type MockMutationOptions = {
  onError: (error: MockMutationError) => void;
};

const mocks = vi.hoisted(() => ({
  invalidateStatus: vi.fn(),
  mutate: vi.fn<(input: unknown, options: MockMutationOptions) => void>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("~/lib/useHandleTRPCError", () => ({
  useHandleTRPCError: () => vi.fn(),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      ai: {
        getStatus: {
          invalidate: mocks.invalidateStatus,
        },
      },
    }),
    ai: {
      askAi: {
        useMutation: () => ({
          isPending: false,
          isError: false,
          mutate: mocks.mutate,
        }),
      },
    },
  },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

const baseProps = {
  docId: "8d40f4b8-9cf5-4c3f-87d9-66cc74ef535d",
  mode: "Clear" as const,
  selectionWordCount: 2,
  selectionCharacterCount: 12,
  selectionVersion: 1,
  panelVersion: 1,
  hasSelection: true,
  aiEnabled: true,
  aiMessage: "Writely AI is ready.",
  remainingTokens: 5_000,
  captureContext: () => ({
    from: 1,
    to: 13,
    selectedText: "Selected text",
    selectedHtml: "<p>Selected text</p>",
  }),
  isContextCurrent: () => true,
  onReplace: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  mocks.invalidateStatus.mockReset();
  mocks.mutate.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AiWritingPanel", () => {
  it("keeps the closed panel mounted for its exit transition", () => {
    act(() => root.render(<AiWritingPanel {...baseProps} isOpen={false} />));

    const panel = container.querySelector<HTMLElement>("aside");
    const backdrop = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Close AI panel"]',
    );

    expect(panel?.hidden).toBe(false);
    expect(panel?.getAttribute("aria-hidden")).toBe("true");
    expect(panel?.hasAttribute("inert")).toBe(true);
    expect(panel?.className).toContain("translate-x-full");
    expect(backdrop?.hidden).toBe(false);
    expect(backdrop?.className).toContain("opacity-0");
  });

  it("slides the panel into view when opened", () => {
    act(() => root.render(<AiWritingPanel {...baseProps} isOpen />));

    const panel = container.querySelector<HTMLElement>("aside");

    expect(panel?.getAttribute("aria-hidden")).toBe("false");
    expect(panel?.hasAttribute("inert")).toBe(false);
    expect(panel?.className).toContain("translate-x-0");
    expect(panel?.className).not.toContain("translate-x-full");
  });

  it("disables AI actions and explains an oversized selection", () => {
    act(() =>
      root.render(
        <AiWritingPanel
          {...baseProps}
          isOpen
          selectionCharacterCount={1_001}
        />,
      ),
    );

    expect(container.textContent).toContain(
      "AI selections can contain up to 1,000 characters.",
    );

    const improveClarityButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Improve clarity"));

    expect(improveClarityButton?.disabled).toBe(true);
  });

  it("keeps the interface language out of AI requests", () => {
    localStorage.setItem(INTERFACE_LANGUAGE_STORAGE_KEY, "Chinese");
    act(() => root.render(<AiWritingPanel {...baseProps} isOpen />));

    const improveClarityButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("提升清晰度"));

    act(() => improveClarityButton?.click());

    expect(mocks.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "improveClarity",
        selectedText: "Selected text",
      }),
      expect.any(Object),
    );
    expect(mocks.mutate.mock.calls[0]?.[0]).not.toHaveProperty(
      "responseLanguage",
    );
  });

  it("shows a friendly message instead of serialized validation details", () => {
    mocks.mutate.mockImplementationOnce((_input, options) => {
      options.onError({
        message:
          '[{"code":"custom","path":["selectedHtml"],"message":"The selected text and formatting do not match."}]',
        data: {
          zodError: {
            formErrors: [],
            fieldErrors: {
              selectedHtml: ["The selected text and formatting do not match."],
            },
          },
        },
      });
    });
    act(() => root.render(<AiWritingPanel {...baseProps} isOpen />));

    const improveClarityButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Improve clarity"));

    act(() => improveClarityButton?.click());

    expect(container.textContent).toContain("Please check your input.");
    expect(container.textContent).not.toContain('"code":"custom"');
  });

  it("clears a request error when the selected text changes", () => {
    mocks.mutate.mockImplementationOnce((_input, options) => {
      options.onError({
        message:
          "This selection is too large for today’s remaining AI allowance.",
      });
    });
    act(() => root.render(<AiWritingPanel {...baseProps} isOpen />));

    const improveClarityButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Improve clarity"));

    act(() => improveClarityButton?.click());

    expect(container.textContent).toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );

    act(() =>
      root.render(
        <AiWritingPanel {...baseProps} isOpen selectionVersion={2} />,
      ),
    );

    expect(container.textContent).not.toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );
  });

  it("clears a request error when the panel closes or a new request begins", () => {
    mocks.mutate.mockImplementationOnce((_input, options) => {
      options.onError({
        message:
          "This selection is too large for today’s remaining AI allowance.",
      });
    });
    act(() => root.render(<AiWritingPanel {...baseProps} isOpen />));

    const improveClarityButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Improve clarity"));

    act(() => improveClarityButton?.click());
    expect(container.textContent).toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );

    act(() => root.render(<AiWritingPanel {...baseProps} isOpen={false} />));
    expect(container.textContent).not.toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );

    act(() =>
      root.render(<AiWritingPanel {...baseProps} isOpen panelVersion={2} />),
    );

    expect(container.textContent).not.toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );

    mocks.mutate.mockImplementationOnce((_input, options) => {
      options.onError({
        message:
          "This selection is too large for today’s remaining AI allowance.",
      });
    });
    act(() => improveClarityButton?.click());
    expect(container.textContent).toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );

    mocks.mutate.mockImplementationOnce(() => undefined);
    act(() => improveClarityButton?.click());

    expect(container.textContent).not.toContain(
      "This selection is too large for today’s remaining AI allowance.",
    );
  });
});
