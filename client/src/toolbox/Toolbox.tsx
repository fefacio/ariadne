import { SvgActions, SvgModes } from '../types';
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

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useGlobalConfig } from '../context/globalConfig/useGlobalConfig';
import type { KeyboardAction } from '../types';

export function Toolbox(){
    const config = useGlobalConfig();
    
    useKeyboardShortcuts();
    const getShortcutLabel = (action: KeyboardAction): string => {
        const shortcut = config.getShortcutByAction(action);
        if (!shortcut) return "";
        
        const parts = [];
        if (shortcut.ctrlKey) parts.push("Ctrl");
        if (shortcut.altKey) parts.push("Alt");
        if (shortcut.shiftKey) parts.push("Shift");
        parts.push(shortcut.key.toUpperCase());
        return parts.join("+");
    };
    
    return (
        <div className="toolbox">
            <ToolboxButton 
                iconSrc={selectIcon} 
                altName={"Select"} 
                interaction={SvgModes.SELECT} 
                hotkey={getShortcutLabel(SvgModes.SELECT)}
            />
            <ToolboxButton 
                iconSrc={addNodeIcon} 
                altName={"Add Node"} 
                interaction={SvgModes.ADD_NODE} 
                hotkey={getShortcutLabel(SvgModes.ADD_NODE)}
            />
            <ToolboxButton 
                iconSrc={addEdgeIcon} 
                altName={"Add Edge"} 
                interaction={SvgModes.ADD_EDGE} 
                hotkey={getShortcutLabel(SvgModes.ADD_EDGE)}
            />
            <ToolboxButton 
                iconSrc={deleteIcon} 
                altName={"Delete"} 
                interaction={SvgModes.DELETE} 
                hotkey={getShortcutLabel(SvgModes.DELETE)}
            />
            <ToolboxButton 
                iconSrc={editIcon} 
                altName={"Edit"} 
                interaction={SvgModes.EDIT} 
                hotkey={getShortcutLabel(SvgModes.EDIT)}
            />
            <ToolboxButton 
                iconSrc={resetIcon} 
                altName={"Reset"} 
                interaction={SvgActions.RESET} 
                hotkey={getShortcutLabel(SvgActions.RESET)}
            />
            <ToolboxButton 
                iconSrc={deleteGraphIcon} 
                altName={"Delete Graph"} 
                interaction={SvgActions.DELETE_GRAPH} 
                hotkey={getShortcutLabel(SvgActions.DELETE_GRAPH)}
            />
            <ToolboxButton 
                iconSrc={configIcon} 
                altName={"Configuration"} 
                interaction={SvgActions.CONFIG}
                hotkey={getShortcutLabel(SvgActions.CONFIG)}
            />
        </div>
    )
}