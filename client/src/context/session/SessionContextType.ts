import type { Mode } from "../../types/types";

export interface SessionContextType {
  sessionId: string;
  currentMode: Mode;
  isLoading: boolean;
  resetKey: number;
  isServerReady: boolean;
  
  newSession: () => void;
  clearSession: () => void;
  setMode: (mode: Mode) => void;
  setIsLoading: (loading: boolean) => void;
  setIsServerReady: (isReady: boolean) => void;
}