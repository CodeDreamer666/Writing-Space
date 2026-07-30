"use client";

import { useEffect } from "react";
import { cleanupStaleLocalDrafts } from "~/features/editor/utils/localDraft";

export default function BetaUtilities() {
  useEffect(() => {
    cleanupStaleLocalDrafts();
  }, []);

  return null;
}
