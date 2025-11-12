import { useCallback, useState } from "react";
import { NodeTypes, type NodeType } from "../../types";
import type { NodeActions } from "../useGraphNodes";

interface NodeParams {
    nodeId: number;
    type: NodeType;
    demand: number | null;
};

interface EditNodeMenuProps {
    nodeId: number;
    nodeActions: NodeActions;
}
export function EditNodeMenu({nodeId, nodeActions}: EditNodeMenuProps) {
    const node = nodeActions.getById(nodeId);
    
    const [nodeParams, setNodeParams] = useState<NodeParams>({
        nodeId: nodeId,
        type: node ? node.type : NodeTypes.NORMAL,
        demand: node ? node.demand : 1
    });

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newType: NodeType = event.target.value as NodeType;
            setNodeParams(prev => ({ ...prev, type: newType }));
            nodeActions.updateType(nodeId, newType);
    },
    [nodeId, nodeActions]
    );

    const handleDemandChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newDemand: number = Math.min(100, Math.max(1, +event.target.value));
            setNodeParams(prev => ({ ...prev, demand: newDemand }));
            nodeActions.updateDemand(nodeId, newDemand);
        },
    [nodeActions, nodeId],
    )

    return (
        <div>
            <p> Node {nodeId} </p>
            <div className="params">
                <div className="params-group">
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
                    {nodeParams.type === NodeTypes.CONSUMER && (
                        <>
                            <label htmlFor="demand">Demand: </label>
                            <input
                                id="demand"
                                type="number"
                                min="1"
                                max="100"
                                step="1"
                                value={nodeParams.demand ?? 1.0}
                                onChange={(e) => handleDemandChange(e)}
                            />
                        </>
                    )}
                </div>
            </div>
        </div >
    )
}