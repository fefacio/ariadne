import type { KeyboardAction } from "../../types";

export interface KeyboardShortcut {
    action: KeyboardAction;
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    description: string;
}

export interface GlobalConfigContextType {
    showLabel: boolean;
    useIdAsLabel: boolean;
    updateShowLabel: (value: boolean) => void;
    updateUseIdAsLabel: (value: boolean) => void;
    

    keyboardShortcuts: KeyboardShortcut[];
    
    updateShortcut: (action: KeyboardAction, newKey: string, modifiers?: {
        ctrlKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
    }) => void;
    
    getShortcutByAction: (action: KeyboardAction) => KeyboardShortcut | undefined;
    getShortcutByKey: (key: string, modifiers?: {
        ctrlKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
    }) => KeyboardShortcut | undefined;
    
    hasConflict: (action: KeyboardAction) => boolean;
    getConflictingActions: (action: KeyboardAction) => KeyboardAction[];
    
    resetToDefaults: () => void;
}