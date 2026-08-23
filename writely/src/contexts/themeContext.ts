import { createContext } from "react";
import type { ResolvedTheme, Theme } from "~/lib/theme";

export type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

export default createContext<ThemeContextValue | null>(null);
