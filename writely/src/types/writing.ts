export const WRITING_MODES = [
  "Clear",
  "Natural",
  "Persuasive",
  "Reflective",
  "Story",
  "Professional",
  "Argumentative",
] as const;

export type WritingMode = (typeof WRITING_MODES)[number];
