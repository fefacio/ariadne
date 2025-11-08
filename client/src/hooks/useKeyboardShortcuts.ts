import { useEffect } from 'react';

interface ShortcutMap {
    [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || 
                e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const key = e.key.toLowerCase();
            const withCtrl = e.ctrlKey || e.metaKey;
            const shortcutKey = withCtrl ? `ctrl+${key}` : key;
            
            if (shortcuts[shortcutKey]) {
                e.preventDefault();
                shortcuts[shortcutKey]();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shortcuts]);
}