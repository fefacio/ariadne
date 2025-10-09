import { useCallback } from "react";
import { NodeTypes, type NodeType } from "../types/types"

interface AddNodeFormProps {
    addNodeType: NodeType;
    setAddNodeType: React.Dispatch<React.SetStateAction<NodeType>>
}

export function AddNodeForm({addNodeType, setAddNodeType}: AddNodeFormProps) {

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setAddNodeType(event.target.value as NodeType);
    },
    [setAddNodeType]);

    return (
        <form className="add-node-form">
            <p>Node Type</p>
            <label> 
                <input
                    type="radio"
                    name="nodeType"
                    value="NORMAL"
                    checked={addNodeType===NodeTypes.NORMAL}
                    onChange={(e) => handleChange(e)}
                /> Normal
            </label>
            <label> 
                <input
                    type="radio"
                    name="nodeType"
                    value="CONSUMER"
                    checked={addNodeType===NodeTypes.CONSUMER}
                    onChange={(e) => handleChange(e)}
                /> Consumer
            </label>
            <label> 
                <input
                    type="radio"
                    name="nodeType"
                    value="FACILITY"
                    checked={addNodeType===NodeTypes.FACILITY}
                    onChange={(e) => handleChange(e)}
                /> Facility
            </label>
        </form>
    )
}