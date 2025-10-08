import { useUIState } from '../context/uiState/useUIState';
import { MenuTypes } from '../types/types';
import './Toolbar.css';

export function Toolbar(){
    const uiStateContext = useUIState();
    return (
        <div className="toolbar">
            <button>Hello</button>
            <button>Goodbye</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_DRAW)}>Drawing</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_GENERATE)}>Generate</button>
        </div>
    )
}