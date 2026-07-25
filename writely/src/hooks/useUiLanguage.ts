"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_INTERFACE_LANGUAGE,
  getStoredInterfaceLanguage,
  INTERFACE_LANGUAGE_CHANGE_EVENT,
} from "~/lib/writingLanguage";
import {
  LANGUAGE_LOCALES,
  translateUi,
  type UiTranslationKey,
} from "~/lib/uiTranslations";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(INTERFACE_LANGUAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(INTERFACE_LANGUAGE_CHANGE_EVENT, onStoreChange);
  };
}

export function useUiLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    getStoredInterfaceLanguage,
    () => DEFAULT_INTERFACE_LANGUAGE,
  );

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_LOCALES[language];
  }, [language]);

  return {
    language,
    locale: LANGUAGE_LOCALES[language],
    t: (key: UiTranslationKey, values?: Record<string, string | number>) =>
      translateUi(language, key, values),
  };
}
