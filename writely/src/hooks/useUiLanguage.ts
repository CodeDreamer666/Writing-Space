"use client";

import { translateUi, type UiTranslationKey } from "~/lib/uiTranslations";

export function useUiLanguage() {
    return {
        locale: "en",
        t: (key: UiTranslationKey, values?: Record<string, string | number>) =>
            translateUi(key, values),
    };
}
