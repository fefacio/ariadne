import { MenuTypes, Modes } from '../types/types';
import './Toolbox.css';
import { ToolboxButton } from './ToolboxButton';


// Icons
import selectIcon from "../assets/selectIcon.svg";
import addEdgeIcon from "../assets/addEdgeIcon.svg";
import addNodeIcon from "../assets/addNodeIcon.svg";
import deleteIcon from "../assets/deleteIcon.svg";
import deleteGraphIcon from "../assets/deleteGraphIcon.svg";
import editIcon from "../assets/editIcon.svg"
import resetIcon from "../assets/resetIcon.svg"
import configIcon from "../assets/configIcon.svg";


import { useSession } from '../context/session/useSession';
import { useUIState } from '../context/uiState/useUIState';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';


export function Toolbox(){
    const sessionContext = useSession();
    const uiState = useUIState();

    useKeyboardShortcuts({
        's': () => sessionContext.setMode(Modes.SELECT),
        'n': () => sessionContext.setMode(Modes.ADD_NODE),
        'e': () => sessionContext.setMode(Modes.ADD_EDGE),
        'd': () => sessionContext.setMode(Modes.DELETE),
        'm': () => sessionContext.setMode(Modes.EDIT),
        'r': () => {
            uiState.addMenu(MenuTypes.MENU_RESET);
            sessionContext.setMode(Modes.RESET);
        },
        'ctrl+x': () => {
            const deleteResponse = window.confirm("Do you want to delete the graph?");
            if (deleteResponse) {
                uiState.clearMenus();
                sessionContext.clearSession();
            } 
        },
        'ctrl+m': () => {
            uiState.clearMenus();
        }
    });
    
    return (
        <div className="toolbox">
            <ToolboxButton iconSrc={selectIcon} altName={"Select"} mode={Modes.SELECT} hotkey='s'/>
            <ToolboxButton iconSrc={addNodeIcon} altName={"Add Node"} mode={Modes.ADD_NODE} hotkey='n'/>
            <ToolboxButton iconSrc={addEdgeIcon} altName={"Add Edge"} mode={Modes.ADD_EDGE} hotkey='e'/>
            <ToolboxButton iconSrc={deleteIcon} altName={"Delete"} mode={Modes.DELETE} hotkey='d'/>
            <ToolboxButton iconSrc={editIcon} altName={"Edit"} mode={Modes.EDIT} hotkey='m'/>
            <ToolboxButton iconSrc={resetIcon} altName={"Reset"} mode={Modes.RESET} hotkey='r'/>
            <ToolboxButton iconSrc={deleteGraphIcon} altName={"Delete Graph"} mode={Modes.DELETE_GRAPH} hotkey="ctrl+x"/>
            <ToolboxButton iconSrc={configIcon} altName={"Configuration"} mode={Modes.DELETE_GRAPH} hotkey="ctrl+c"/>
        </div>
    )
}