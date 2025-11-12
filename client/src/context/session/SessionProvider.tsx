import React, { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { SessionContextType } from "./SessionContextType";
import { SessionContext } from "./SessionContext";
import { graphAPI } from "../../graph/graphAPI";



export const SessionProvider: React.FC<PropsWithChildren> = (props) => {
    const [sessionId] = useState<string>(() => {
        return `session_${crypto.randomUUID()}`;
    })
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0);
    const [isServerReady, setIsServerReady] = useState<boolean>(false);

    const checkServerIsUp = useCallback(async () => {
        console.log("Checking backend");
        
        try {
            const response = await graphAPI.checkHealth();
            if (response && response.isServerUp) {
                console.log("Backend ready!");
                setIsServerReady(true);
            } else {
                throw new Error("Server is down");
            }
        } catch(e) {
            console.warn("Backend not ready: ", e);
            setTimeout(checkServerIsUp, 2000);
        } 
    },
    []);

    const newSession = useCallback( async () => {
        console.log("Session id: "+sessionId);
        checkServerIsUp();
    },
    [sessionId, checkServerIsUp])

    
    const resetFrontend = useCallback(() => {
        setResetKey(prev => prev + 1); 
    }, []);

    const clearSession = useCallback(() => {
        graphAPI.clearGraph();
        resetFrontend();
    },
    [resetFrontend])

    

    useEffect(() => {
        window.addEventListener('pageshow', newSession);
        window.addEventListener('pagehide', clearSession);
        window.addEventListener('beforeunload', clearSession);  
        window.addEventListener('unload', clearSession);

        
        return () => {
            window.removeEventListener('pageshow', newSession);
            window.removeEventListener('pagehide', clearSession);
            window.removeEventListener('beforeunload', clearSession);
            window.removeEventListener('unload', clearSession);
        };
    }, [newSession, clearSession]);

    const sessionContext: SessionContextType = useMemo(() => ({
        sessionId,
        newSession,
        clearSession,
        isLoading,
        setIsLoading,
        resetKey,
        isServerReady,
        setIsServerReady
    }), [clearSession, 
        isLoading, 
        newSession, 
        sessionId, 
        resetKey, 
        isServerReady]);

    return (
        <SessionContext.Provider value={sessionContext}>
            {props.children}
        </SessionContext.Provider>
    )
}

