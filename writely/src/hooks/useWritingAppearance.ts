"use client";
import { useSyncExternalStore } from "react";
import readWritingAppearance from "~/lib/readWritingAppearance";
import storeWritingAppearance from "~/lib/storeWritingAppearance";
import subscribeWritingAppearance from "~/hooks/subscribeWritingAppearance";
import {
  DEFAULT_WRITING_APPEARANCE,
  type WritingAppearance,
} from "~/lib/writingAppearance";

export default function useWritingAppearance() {
  const appearance = useSyncExternalStore(
    subscribeWritingAppearance,
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
