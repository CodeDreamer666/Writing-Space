import { THEMES, type Theme } from "./theme";

export default function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}
