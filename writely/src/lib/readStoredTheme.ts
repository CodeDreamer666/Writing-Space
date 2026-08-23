import isTheme from "~/lib/isTheme";
import { THEME_STORAGE_KEY, type Theme } from "~/lib/theme";

export default function readStoredTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}
