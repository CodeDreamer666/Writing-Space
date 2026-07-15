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
export type AiScope = "selection" | "document";

export type CapturedAiContext = {
  scope: AiScope;
  selectedText?: string;
  fullDocument: string;
  from?: number;
  to?: number;
};
