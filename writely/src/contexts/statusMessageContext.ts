import { createContext } from "react";

export type StatusMessageContextValue = {
  showMessage: (message: string, isSuccess: boolean) => void;
};

export default createContext<StatusMessageContextValue | null>(null);
