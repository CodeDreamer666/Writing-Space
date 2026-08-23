import type { ResolvedTheme, Theme } from "./theme";

export default function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): ResolvedTheme {
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}
