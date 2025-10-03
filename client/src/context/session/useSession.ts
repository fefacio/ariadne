import { useContext } from "react";
import type { SessionContextType } from "./SessionContextType";
import { SessionContext } from "./SessionContext";

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext); // ← Usa o Context aqui
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};