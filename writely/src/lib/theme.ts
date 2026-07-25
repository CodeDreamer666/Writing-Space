export const THEME_STORAGE_KEY = "writely:theme";

export const THEMES = ["light", "dark", "system"] as const;

export type Theme = (typeof THEMES)[number];
export type ResolvedTheme = Exclude<Theme, "system">;

export function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): ResolvedTheme {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }

  return theme;
}
