"use client";

import { useTheme } from "~/components/layout/ThemeProvider";
import { THEMES, type Theme } from "~/lib/theme";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const themeLabels: Record<Theme, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

  return (
    <fieldset>
      <legend className="sr-only">Choose a theme</legend>
      <div className="grid max-w-md grid-cols-3 gap-2 rounded-xl border border-[var(--w-border)] bg-[var(--w-surface)] p-1.5">
        {THEMES.map((option) => {
          const isSelected = theme === option;

          return (
            <button
              key={option}
              type="button"
              suppressHydrationWarning
              aria-pressed={isSelected}
              onClick={() => setTheme(option)}
              className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-[var(--w-foreground)] text-[var(--w-background)]"
                  : "text-[var(--w-muted)] hover:bg-[var(--w-surface-raised)] hover:text-[var(--w-foreground)]"
              }`}
            >
              {themeLabels[option]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
