import { useUIState } from '../context/uiState/useUIState';
import { MenuTypes } from '../types';
import './Toolbar.css';

export function Toolbar(){
    const uiStateContext = useUIState();
    return (
        <div className="toolbar">
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_DEBUG)}>Debug</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_DRAW)}>Drawing</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_GENERATE)}>Generate</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_RANDOMIZER)}>Randomizer</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_FILE_IO)}>File</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_SEARCH)}>Search</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_CLUSTER)}>Cluster</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_STATS)}>Stats</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_PMEDIAN)}>P-Median</button>
            <button onClick={() => uiStateContext.addMenu(MenuTypes.MENU_REPORT)}>Report</button>
        </div>
    )
}