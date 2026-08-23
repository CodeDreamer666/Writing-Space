export const AI_ACTIONS = [
  "clarify",
  "makeNatural",
  "strengthen",
  "tighten",
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

export type CapturedAiContext = {
  selectedText: string;
  selectedHtml: string;
  from: number;
  to: number;
};
