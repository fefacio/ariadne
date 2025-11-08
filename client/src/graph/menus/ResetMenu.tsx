import { useState } from "react";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import type { EdgeActions } from "../useGraphEdges";
import type { NodeActions } from "../useGraphNodes"
import { type NodeType, NodeTypes } from "../../types/types";

interface ResetMenuProps {
    nodeActions: NodeActions;
    edgeActions: EdgeActions;
};

export function ResetMenu({nodeActions, edgeActions}: ResetMenuProps) {
    const [weight, setWeight] = useState<number>(1.0);
    const [nodeType, setNodeType] = useState<NodeType>(NodeTypes.NORMAL);

    const nodes = nodeActions.getNodes();
    console.log("MY "+nodes);
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
                <CollapsibleSection title="Edge">
                    <div className="params-group">
                        <label htmlFor="weight">Weight: </label>
                        <input
                            id="weight"
                            type="number" 
                            value={weight} 
                            onChange={(e) => setWeight(+e.target.value)}
                        />
                    </div>
                    <div className="menu-button">
                        <button onClick={handleEdgeReset}> Reset </button>
                    </div>
                </CollapsibleSection>
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

                    </div>
                    <div className="menu-button">
                        <button onClick={handleNodeReset}> Reset </button>
                    </div>
                </CollapsibleSection>
            </div>      
        </div>
    )
}

/*  (INSIDE DrawMenuContent)
    DropDownMenu -> Drawing Type (ForceDirected, KamadaKawai...)
    Ex: Selected ForceDirected
    Component(DrawingOptions)
        edgeLength:
        maxIterations:
        coolingFunctionStarterValue:

    (INSIDE DrawMenuContent)
    DropDownMenu -> Drawing Type (ForceDirected, KamadaKawai...)
    Ex: Selected KamadaKawai
    Component(DrawingOptions)
        factor:
        maxIterations:
        coolingFunctionStarterValue:
*/