import { useState } from "react";
import type { GraphNode, NodeActions } from "../useGraphNodes";
import "./Menus.css";
import type { EdgeActions, GraphEdge } from "../useGraphEdges";

interface DebugMenuProps {
    nodeActions: NodeActions
    edgeActions: EdgeActions
}

export function DebugMenu({nodeActions, edgeActions}: DebugMenuProps) {
    const [nodes, setNodes] = useState<GraphNode[] | null>(null);
    const [edges, setEdges] = useState<GraphEdge[] | null>(null);


    const handleTest2 = () => {
        const result = nodeActions.getNodes();
        console.log("getNodes returned:", result);
        setNodes(result);
    }

    const handleTest3 = () => {
        const result = edgeActions.getEdges();
        console.log("getEdges returned:", result);
        setEdges(result);
    }
    return (
        <div className="params">
            <button onClick={handleTest2}> Print Node List</button>
            <button onClick={handleTest3}> Print Edge List</button>
            {nodes!==null && (
                <div>
                    <span> NODES </span>
                    {nodes.map((node) => (
                        <p key={node.id}>
                            ID: {node.id}, Type: {node.type}, Demand: {node.demand ? node.demand : "null"}
                        </p>
                    ))}
                </div>
            )}
            {edges!==null && (
                <div>
                    <span> EDGES </span>
                    {edges.map((edge) => (
                        <p key={edge.id}>
                            ID: {edge.id}, Source: {edge.sourceId}, Target: {edge.targetId}, Weight: {edge.weight}
                        </p>
                    ))}
                </div>
            )}
        </div >
        
    )
}