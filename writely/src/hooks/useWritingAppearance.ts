"use client";

import { useSyncExternalStore } from "react";
import {
    DEFAULT_WRITING_APPEARANCE,
    readWritingAppearance,
    storeWritingAppearance,
    WRITING_APPEARANCE_CHANGE_EVENT,
    WRITING_APPEARANCE_STORAGE_KEY,
    type WritingAppearance,
} from "~/lib/writingAppearance";

function subscribe(onStoreChange: () => void) {
    const handleStorage = (event: StorageEvent) => {
        if (event.key === WRITING_APPEARANCE_STORAGE_KEY) {
            onStoreChange();
        }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(WRITING_APPEARANCE_CHANGE_EVENT, onStoreChange);

    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(WRITING_APPEARANCE_CHANGE_EVENT, onStoreChange);
    };
}

export function useWritingAppearance() {
    const appearance = useSyncExternalStore(
        subscribe,
        readWritingAppearance,
        () => DEFAULT_WRITING_APPEARANCE,
    );

    const updateAppearance = (updates: Partial<WritingAppearance>) => {
        storeWritingAppearance({
            ...readWritingAppearance(),
            ...updates,
        });
    };

    return {
        appearance,
        updateAppearance,
    };
}
