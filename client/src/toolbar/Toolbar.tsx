import { useUIState } from '../context/uiState/useUIState';
import { MenuTypes } from '../types/types';
import './Toolbar.css';

export function Toolbar(){
    const uiStateContext = useUIState();
    return (
        <div className="toolbar">
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_HELLO)}>Hello</button>
            <button>Goodbye</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_DRAW)}>Drawing</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_GENERATE)}>Generate</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_RANDOMIZER)}>Randomizer</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_FILE_IO)}>File</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_SEARCH)}>Search</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_CLUSTER)}>Cluster</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_STATS)}>Stats</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_PMEDIAN)}>P-Median</button>
        </div>
    )
}