import parseWritingAppearance from "./parseWritingAppearance";
import {
  DEFAULT_WRITING_APPEARANCE,
  WRITING_APPEARANCE_STORAGE_KEY,
  writingAppearanceState,
  type WritingAppearance,
} from "./writingAppearance";

export default function readWritingAppearance(): WritingAppearance {
  if (typeof window === "undefined") return DEFAULT_WRITING_APPEARANCE;
  let storedValue: string | null;
  try {
    storedValue = window.localStorage.getItem(WRITING_APPEARANCE_STORAGE_KEY);
  } catch {
    return writingAppearanceState.currentAppearance;
  }
  if (storedValue === writingAppearanceState.lastStoredValue)
    return writingAppearanceState.currentAppearance;
  writingAppearanceState.lastStoredValue = storedValue;
  if (!storedValue) {
    writingAppearanceState.currentAppearance = DEFAULT_WRITING_APPEARANCE;
    return writingAppearanceState.currentAppearance;
  }
  try {
    writingAppearanceState.currentAppearance = parseWritingAppearance(
      JSON.parse(storedValue),
    );
  } catch {
    writingAppearanceState.currentAppearance = DEFAULT_WRITING_APPEARANCE;
  }
  return writingAppearanceState.currentAppearance;
}
