import { useContext } from "react";
import type { GlobalConfigContextType } from "./GlobalConfigContextType";
import { GlobalConfigContext } from "./GlobalConfigContext";

export const useGlobalConfig = (): GlobalConfigContextType => {
  const context = useContext(GlobalConfigContext);
  if (!context) {
    throw new Error('useGlobalConfig must be used within GlobalConfigProvider');
  }
  return context;
};