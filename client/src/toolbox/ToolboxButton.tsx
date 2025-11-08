import { useSession } from '../context/session/useSession';
import { useUIState } from '../context/uiState/useUIState';
import { MenuTypes, Modes, type Mode } from '../types/types'
import './Toolbox.css'

interface ToolboxButtonProps {
    iconSrc: string;
    altName: string;
    mode: Mode;
    hotkey: string;
};



export function ToolboxButton({iconSrc, altName, mode, hotkey}: ToolboxButtonProps){
    const sessionContext = useSession();
    const uiState = useUIState();
    const isActive = sessionContext.currentMode === mode;

    const handleToolboxButtonClick = () => {
        if (mode === Modes.DELETE_GRAPH){
            const deleteResponse: boolean = window.confirm("Do you want to delete the graph?");
            if (deleteResponse) {
                uiState.clearMenus();
                sessionContext.clearSession();
                return;
            }
        }

        if (mode === Modes.RESET){
            uiState.addMenu(MenuTypes.MENU_RESET);
        }

        sessionContext.setMode(mode)
    }

    return (
        <>
            <button 
                className={`toolbox-button ${isActive ? 'active' : ''}`}
                onClick={() => handleToolboxButtonClick()}
                title={hotkey ? `${altName} (${hotkey})` : altName}
            >
                <img src={iconSrc} alt={altName}  className="icon"/>
            </button>
        </>
        
    )
}