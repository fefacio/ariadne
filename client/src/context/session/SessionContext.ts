import { createContext } from "react";
import type { SessionContextType } from "./SessionContextType";

export const SessionContext = createContext<SessionContextType | undefined>(undefined);