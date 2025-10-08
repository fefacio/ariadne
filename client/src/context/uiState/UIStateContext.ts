import { createContext } from "react";
import type { UIStateContextType } from "./UIStateContextType";

export const UIStateContext = createContext<UIStateContextType | undefined>(undefined);