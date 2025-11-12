import { createContext } from "react";
import type { GlobalConfigContextType } from "./GlobalConfigContextType";

export const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);