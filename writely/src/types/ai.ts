export const AI_ACTIONS = [
  "improveClarity",
  "fixGrammar",
  "makeNatural",
  "makeStronger",
  "findWeakPoints",
  "suggestDirections",
  "custom",
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

export type CapturedAiContext = {
  selectedText: string;
  from: number;
  to: number;
};
