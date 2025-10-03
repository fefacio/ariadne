import { useSession } from '../context/session/useSession';
import { Modes, type Mode } from '../types/types'
import './Toolbox.css'

interface ToolboxButtonProps {
    iconSrc: string,
    altName: string,
    mode: Mode,
}



export function ToolboxButton({iconSrc, altName, mode}: ToolboxButtonProps){
    const sessionContext = useSession();
    const isActive = sessionContext.currentMode === mode;

    const handleToolboxButtonClick = () => {
        if (mode === Modes.DELETE_GRAPH){
            const deleteResponse: boolean = window.confirm("Do you want to delete the graph?");
            if (deleteResponse) {
                sessionContext.clearSession();
                return;
            }
        }

        sessionContext.setMode(mode)
    }

    return (
        <>
            <button className={`toolbox-button ${isActive ? 'active' : ''}`}
                onClick={() => handleToolboxButtonClick()}>
                <img src={iconSrc} alt={altName} title={altName} className="icon"/>
            </button>
        </>
        
    )
}