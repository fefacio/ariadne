import type { MenuType, Mode } from "../../types/types";

export interface SessionContextType {
  // Session data
  sessionId: string;
  currentMode: Mode;
  isLoading: boolean;
  resetKey: number;
  openMenu: MenuType | null;
  
  newSession: () => void;
  clearSession: () => void;
  setMode: (mode: Mode) => void;
  setIsLoading: (loading: boolean) => void;
  setOpenMenu: (menu: MenuType | null) => void;
}