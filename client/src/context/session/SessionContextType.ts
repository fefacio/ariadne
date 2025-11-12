export interface SessionContextType {
    sessionId: string;
    
    isLoading: boolean;
    resetKey: number;
    isServerReady: boolean;
    
    newSession: () => void;
    clearSession: () => void;
    setIsLoading: (loading: boolean) => void;
    setIsServerReady: (isReady: boolean) => void;
}