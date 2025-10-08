import { useContext } from "react";
import type { UIStateContextType } from "./UIStateContextType";
import { UIStateContext } from "./UIStateContext";

export const useUIState = (): UIStateContextType => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within UIStateProvider');
  }
  return context;
};