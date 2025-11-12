import { useSession } from '../context/session/useSession';
import { useUIState } from '../context/uiState/useUIState';
import { isSvgAction, isSvgMode, MenuTypes, SvgActions, type SvgInteraction } from '../types'
import './Toolbox.css'

interface ToolboxButtonProps {
    iconSrc: string;
    altName: string;
    interaction: SvgInteraction;
    hotkey: string;
};



export function ToolboxButton({iconSrc, altName, interaction}: ToolboxButtonProps) {
    const session = useSession();
    const uiState = useUIState();
    
    const isActive = isSvgMode(interaction) &&  uiState.currentMode === interaction;

    const handleToolboxButtonClick = () => {
        if (isSvgMode(interaction)) {
            uiState.setMode(interaction);
            return;
        }
        if (isSvgAction(interaction)) {
            switch (interaction) {
                case SvgActions.RESET:
                    uiState.addMenu(MenuTypes.MENU_RESET);
                    break;

                case SvgActions.DELETE_GRAPH: {
                    const deleteResponse = window.confirm("Do you want to delete the graph?");
                    if (deleteResponse) {
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

    return (
        <button 
            className={`toolbox-button ${isActive ? 'active' : ''}`}
            onClick={handleToolboxButtonClick}
            title={altName}
        >
            <img src={iconSrc} alt={altName} className="icon"/>
        </button>
    );
}