import React, { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { type MenuType, Modes, type Mode } from "../../types/types";
import type { SessionContextType } from "./SessionContextType";
import { SessionContext } from "./SessionContext";
import { graphAPI } from "../../graph/graphAPI";



export const SessionProvider: React.FC<PropsWithChildren> = (props) => {
    const [sessionId] = useState<string>(() => {
        return `session_${crypto.randomUUID()}`;
    })
    const [currentMode, setCurrentMode] = useState<Mode>(Modes.SELECT);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0);
    const [openMenu, setOpenMenu] = useState<MenuType | null>(null);
    const [isServerReady, setIsServerReady] = useState<boolean>(false);

    const checkServerIsUp = useCallback(async () => {
    console.log("Checking backend");
    
    try {
        const response = await graphAPI.checkHealth();
        console.log("RESPOSTA!!", response);

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
        console.log("NEW SESSION: "+sessionId);
        checkServerIsUp();
    },
    [sessionId, checkServerIsUp])

    
    const resetFrontend = useCallback(() => {
        console.log("RESETTING FRONTEND");
        setResetKey(prev => prev + 1); 
        setCurrentMode(Modes.SELECT);
    }, []);

    const clearSession = useCallback(() => {
        console.log("BYE BYE!");
        graphAPI.clearGraph();
        resetFrontend();
    },
    [resetFrontend])

    const setMode = useCallback(
        (mode: Mode) => {
            console.log("NEW MODE IS: "+mode);
            setCurrentMode(mode);
        },
        []
    );

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
        currentMode,
        setMode,
        newSession,
        clearSession,
        isLoading,
        setIsLoading,
        resetKey,
        openMenu,
        setOpenMenu,
        isServerReady,
        setIsServerReady
    }), [clearSession, 
        currentMode, 
        setMode, 
        isLoading, 
        newSession, 
        sessionId, 
        resetKey, 
        openMenu, 
        setOpenMenu,
        isServerReady]);

    return (
        <SessionContext.Provider value={sessionContext}>
            {props.children}
        </SessionContext.Provider>
    )
}

