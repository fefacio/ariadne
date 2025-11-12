import { useEffect } from 'react';
import { useGlobalConfig } from '../context/globalConfig/useGlobalConfig';
import { useSession } from '../context/session/useSession';
import { useUIState } from '../context/uiState/useUIState';
import { SvgActions, MenuTypes, isSvgMode, isSvgAction } from '../types';

export function useKeyboardShortcuts() {
    const config = useGlobalConfig();
    const session = useSession();
    const uiState = useUIState();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
        // Ignorar se estiver digitando em input/textarea
        if (e.target instanceof HTMLInputElement || 
            e.target instanceof HTMLTextAreaElement) {
            return;
        }

        const shortcut = config.getShortcutByKey(e.key, {
            ctrlKey: e.ctrlKey || e.metaKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
        });

        if (!shortcut) return;

        e.preventDefault();

        const action = shortcut.action;

        if (isSvgMode(action)) {
            uiState.setMode(action);
            return;
        }

        if (isSvgAction(action)) {
            switch (action) {
            case SvgActions.RESET:
                uiState.addMenu(MenuTypes.MENU_RESET);
                break;

            case SvgActions.DELETE_GRAPH: {
                const confirmed = window.confirm("Do you want to delete the graph?");
                if (confirmed) {
                    uiState.clearMenus();
                    session.clearSession();
                }
                break;
            }
            case SvgActions.CONFIG:
                uiState.addMenu(MenuTypes.MENU_GLOBAL_CONFIG);
                break;
            }
        }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [config, session, uiState]);
}