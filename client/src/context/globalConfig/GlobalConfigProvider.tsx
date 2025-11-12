import React, { useState, useCallback, useMemo, useEffect, type PropsWithChildren } from "react";
import type { GlobalConfigContextType, KeyboardShortcut } from "./GlobalConfigContextType";
import { GlobalConfigContext } from "./GlobalConfigContext";
import { SvgModes, SvgActions, type KeyboardAction } from "../../types";

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // SvgModes
  { action: SvgModes.SELECT, key: 's', description: 'Select mode' },
  { action: SvgModes.ADD_NODE, key: 'n', description: 'Add node mode' },
  { action: SvgModes.ADD_EDGE, key: 'e', description: 'Add edge mode' },
  { action: SvgModes.DELETE, key: 'd', description: 'Delete mode' },
  { action: SvgModes.EDIT, key: 'm', description: 'Edit mode' },
  
  // SvgActions
  { action: SvgActions.RESET, key: 'r', description: 'Reset view' },
  { action: SvgActions.DELETE_GRAPH, key: 'x', ctrlKey: true, description: 'Delete graph' },
  { action: SvgActions.CONFIG, key: 'g', ctrlKey: true, description: 'Open config' },
];

const STORAGE_KEY = 'graph-app-keyboard-shortcuts';

export const GlobalConfigProvider: React.FC<PropsWithChildren> = (props) => {
    const [showLabel, setShowLabel] = useState<boolean>(true);
    const [useIdAsLabel, setUseIdAsLabel] = useState<boolean>(true);

    // Use local storage to save shortcuts
    const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcut[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return DEFAULT_SHORTCUTS;
            }
        }
        return DEFAULT_SHORTCUTS;
    });
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keyboardShortcuts));
    }, [keyboardShortcuts]);


    const updateShowLabel = useCallback((value: boolean) => {
        setShowLabel(value);
    }, []);

    const updateUseIdAsLabel = useCallback((value: boolean) => {
        setUseIdAsLabel(value);
    }, []);


    const updateShortcut = useCallback((
        action: KeyboardAction,
        newKey: string,
        modifiers?: {
            ctrlKey?: boolean;
            altKey?: boolean;
            shiftKey?: boolean;
        }
    ) => {
        setKeyboardShortcuts(prev => {
            return prev.map(shortcut => {
                if (shortcut.action === action) {
                    return {
                        ...shortcut,
                        key: newKey.toLowerCase(),
                        ctrlKey: modifiers?.ctrlKey,
                        altKey: modifiers?.altKey,
                        shiftKey: modifiers?.shiftKey,
                    };
                }
                return shortcut;
            });
        });
    }, []);

    const getShortcutByAction = useCallback((action: KeyboardAction): KeyboardShortcut | undefined => {
        return keyboardShortcuts.find(s => s.action === action);
    }, [keyboardShortcuts]);

    const getShortcutByKey = useCallback((
        key: string,
        modifiers?: {
            ctrlKey?: boolean;
            altKey?: boolean;
            shiftKey?: boolean;
        }
    ): KeyboardShortcut | undefined => {
        return keyboardShortcuts.find(s => 
            s.key === key.toLowerCase() &&
            !!s.ctrlKey === !!modifiers?.ctrlKey &&
            !!s.altKey === !!modifiers?.altKey &&
            !!s.shiftKey === !!modifiers?.shiftKey
        );
    }, [keyboardShortcuts]);

    const hasConflict = useCallback((action: KeyboardAction): boolean => {
        const shortcut = getShortcutByAction(action);
        if (!shortcut) return false;

        const conflicts = keyboardShortcuts.filter(s => 
            s.key === shortcut.key &&
            !!s.ctrlKey === !!shortcut.ctrlKey &&
            !!s.altKey === !!shortcut.altKey &&
            !!s.shiftKey === !!shortcut.shiftKey
        );

        return conflicts.length > 1;
    }, [keyboardShortcuts, getShortcutByAction]);

    const getConflictingActions = useCallback((action: KeyboardAction): KeyboardAction[] => {
        const shortcut = getShortcutByAction(action);
        if (!shortcut) return [];

        return keyboardShortcuts
            .filter(s => 
                s.action !== action && 
                s.key === shortcut.key &&
                !!s.ctrlKey === !!shortcut.ctrlKey &&
                !!s.altKey === !!shortcut.altKey &&
                !!s.shiftKey === !!shortcut.shiftKey
            )
            .map(s => s.action);
    }, [keyboardShortcuts, getShortcutByAction]);

    const resetToDefaults = useCallback(() => {
        setKeyboardShortcuts(DEFAULT_SHORTCUTS);
    }, []);

    const contextValue: GlobalConfigContextType = useMemo(() => ({
        showLabel,
        useIdAsLabel,
        updateShowLabel,
        updateUseIdAsLabel,
        keyboardShortcuts,
        updateShortcut,
        getShortcutByAction,
        getShortcutByKey,
        hasConflict,
        getConflictingActions,
        resetToDefaults,
    }), [showLabel, useIdAsLabel, updateShowLabel, updateUseIdAsLabel, keyboardShortcuts, updateShortcut, getShortcutByAction, getShortcutByKey, hasConflict, getConflictingActions, resetToDefaults]);

    return (
        <GlobalConfigContext.Provider value={contextValue}>
            {props.children}
        </GlobalConfigContext.Provider>
    );
};