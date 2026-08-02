"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
    isTheme,
    resolveTheme,
    THEME_STORAGE_KEY,
    type ResolvedTheme,
    type Theme,
} from "~/lib/theme";

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isTheme(storedTheme) ? storedTheme : "system";
    } catch {
        return "system";
    }
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === "undefined") {
            return "system";
        }

        return readStoredTheme();
    });
    const [prefersDark, setPrefersDark] = useState(() =>
        typeof window === "undefined"
            ? true
            : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = (event: MediaQueryListEvent) => {
            setPrefersDark(event.matches);
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, []);

    const resolvedTheme = resolveTheme(theme, prefersDark);

    useEffect(() => {
        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    const setTheme = (nextTheme: Theme) => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
            // The in-memory choice still applies when browser storage is unavailable.
        }
        setThemeState(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
