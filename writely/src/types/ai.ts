export const AI_ACTIONS = [
  "improveClarity",
  "fixGrammar",
  "makeNatural",
  "makeStronger",
  "makeConcise",
  "improveFlow",
  "improveWordChoice",
  "removeRepetition",
  "custom",
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

export type CapturedAiContext = {
  selectedText: string;
  selectedHtml: string;
  from: number;
  to: number;
};
