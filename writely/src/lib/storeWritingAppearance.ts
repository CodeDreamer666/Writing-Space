import {
  WRITING_APPEARANCE_CHANGE_EVENT,
  WRITING_APPEARANCE_STORAGE_KEY,
  writingAppearanceState,
  type WritingAppearance,
} from "./writingAppearance";

export default function storeWritingAppearance(appearance: WritingAppearance) {
  writingAppearanceState.currentAppearance = appearance;
  writingAppearanceState.lastStoredValue = JSON.stringify(appearance);
  try {
    window.localStorage.setItem(
      WRITING_APPEARANCE_STORAGE_KEY,
      writingAppearanceState.lastStoredValue,
    );
  } catch {}
  window.dispatchEvent(new Event(WRITING_APPEARANCE_CHANGE_EVENT));
}
