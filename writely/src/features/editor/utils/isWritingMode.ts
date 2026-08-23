import { WRITING_MODES, type WritingMode } from "~/types/writing";

export default function isWritingMode(value: string): value is WritingMode {
  return WRITING_MODES.includes(value as WritingMode);
}
