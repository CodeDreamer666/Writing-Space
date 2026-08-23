import {
  WRITING_APPEARANCE_CHANGE_EVENT,
  WRITING_APPEARANCE_STORAGE_KEY,
} from "~/lib/writingAppearance";

export default function subscribeWritingAppearance(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === WRITING_APPEARANCE_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(WRITING_APPEARANCE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WRITING_APPEARANCE_CHANGE_EVENT, onStoreChange);
  };
}
