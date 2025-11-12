import { useState } from "react";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import type { EdgeActions } from "../useGraphEdges";
import type { NodeActions } from "../useGraphNodes"
import { type NodeType, NodeTypes } from "../../types";

interface ResetMenuProps {
    nodeActions: NodeActions;
    edgeActions: EdgeActions;
};

export function ResetMenu({nodeActions, edgeActions}: ResetMenuProps) {
    const [weight, setWeight] = useState<number>(1.0);
    const [nodeType, setNodeType] = useState<NodeType>(NodeTypes.NORMAL);

    const handleEdgeReset = () => {
        const edges = edgeActions.getEdges();
        edges.forEach(e => edgeActions.updateWeight(e.id, weight));
    }
    const handleNodeReset = () => {
        const nodes = nodeActions.getNodes();
        nodes.forEach(n => nodeActions.updateType(n.id, nodeType));
    }
    return (
        <div className="menu-content">
            <div className="params">
                <CollapsibleSection title="Node">
                    <div className="params-group">
                        <label htmlFor="nodeType">Node Type: </label>
                        <select
                            id="nodeType"
                            value={nodeType}
                            onChange={(e) => setNodeType(e.target.value as NodeType)}
                        >
                            <option value={NodeTypes.NORMAL}>Normal</option>
                            <option value={NodeTypes.CONSUMER}>Consumer</option>
                            <option value={NodeTypes.FACILITY}>Facility</option>
                        </select>

                        <span> Reset node type </span>
                        <button onClick={handleNodeReset}> Reset </button>
                        <span> Reset node style </span>
                        <button onClick={nodeActions.resetStyles}> Reset </button>
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="Edge">
                    <div className="params-group">
                        <label htmlFor="weight">Weight: </label>
                        <input
                            id="weight"
                            type="number" 
                            value={weight} 
                            onChange={(e) => setWeight(+e.target.value)}
                        />
                        <span> Reset edge weight </span>
                        <button onClick={handleEdgeReset}> Reset </button>
                        <span> Reset edge style </span>
                        <button onClick={edgeActions.resetStyles}> Reset </button>
                    </div>
                </CollapsibleSection>
            </div>      
        </div>
    )
}
