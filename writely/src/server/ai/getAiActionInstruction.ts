import type { AiAction } from "~/types/ai";

const actionInstructions: Record<AiAction, string> = {
  clarify: "Apply the Clarify action to the selected text.",
  makeNatural: "Apply the Natural action to the selected text.",
  strengthen: "Apply the Strengthen action to the selected text.",
  tighten: "Apply the Tighten action to the selected text.",
};

export default function getAiActionInstruction(action: AiAction) {
  return actionInstructions[action];
}
