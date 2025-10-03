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

    const newSession = useCallback(() => {
        console.log("NEW SESSION: "+sessionId);
    },
    [sessionId])

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
        window.addEventListener('beforeunload', clearSession);  // Antes de sair
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
        setOpenMenu
    }), [clearSession, currentMode, setMode, isLoading, newSession, sessionId, resetKey, openMenu, setOpenMenu]);

    return (
        <SessionContext.Provider value={sessionContext}>
            {props.children}
        </SessionContext.Provider>
    )
}

