import { Modes } from '../types/types';
import './Toolbox.css';
import { ToolboxButton } from './ToolboxButton';

import selectIcon from "../assets/selectIcon.svg";
import addEdgeIcon from "../assets/addEdgeIcon.svg";
import addNodeIcon from "../assets/addNodeIcon.svg";
import deleteIcon from "../assets/deleteIcon.svg";
import deleteGraphIcon from "../assets/deleteGraphIcon.svg";


export function Toolbox(){
    return (
        <div className="toolbox">
            <ToolboxButton iconSrc={selectIcon} altName={"Select"} mode={Modes.SELECT}/>
            <ToolboxButton iconSrc={addNodeIcon} altName={"Add Node"} mode={Modes.ADD_NODE}/>
            <ToolboxButton iconSrc={addEdgeIcon} altName={"Add Edge"} mode={Modes.ADD_EDGE}/>
            <ToolboxButton iconSrc={deleteIcon} altName={"Delete"} mode={Modes.DELETE}/>
            <ToolboxButton iconSrc={deleteGraphIcon} altName={"Delete Graph"} mode={Modes.DELETE_GRAPH}/>
        </div>
    )
}