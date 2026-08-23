"use client";
import { useContext } from "react";
import StatusMessageContext from "~/contexts/statusMessageContext";

export default function useStatusMessage() {
  const context = useContext(StatusMessageContext);

  if (!context) {
    throw new Error(
      "useStatusMessage must be used inside StatusMessageProvider",
    );
  }

  return context;
}
