import { useCallback, useState } from "react";
import { NodeTypes, type NodeType } from "../../types/types";
import type { NodeActions } from "../useGraphNodes";

interface NodeParams {
    nodeId: number;
    type: NodeType;
};

interface EditNodeMenuProps {
    nodeId: number;
    nodeActions: NodeActions;
}
export function EditNodeMenu({nodeId, nodeActions}: EditNodeMenuProps) {
    const node = nodeActions.getById(nodeId);
    
    const [nodeParams, setNodeParams] = useState<NodeParams>({
        nodeId: nodeId,
        type: node ? node.type : NodeTypes.NORMAL
    });

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newType: NodeType = event.target.value as NodeType;
            setNodeParams(prev => ({ ...prev, type: newType }));
            nodeActions.updateType(nodeId, newType);
            console.log("NEWTYPE: "+nodeParams.type);

    },
    [nodeId, nodeParams.type, nodeActions]);

    return (
        <div>
            <p> Node </p>
            <div className="params">
                <label htmlFor="nodeType">Node Type: </label>
                <select
                    id={"nodeType"}
                    value={nodeParams.type}
                    onChange={(e) => handleChange(e)}
                >
                    {Object.values(NodeTypes).map( type => (
                        <option
                            key={type}
                            value={type}
                        >
                            {type}
                        </option>
                    ))}

                </select>
            
            </div>
        </div >
    )
}