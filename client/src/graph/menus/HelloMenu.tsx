import { useState } from "react";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import type { NodeActions } from "../useGraphNodes";
import "./Menus.css";
import type { GraphEdge, GraphNode } from "../SVGCanvas";
import type { EdgeActions } from "../useGraphEdges";

interface HelloMenuProps {
    nodeActions: NodeActions
    edgeActions: EdgeActions
}

export function HelloMenu({nodeActions, edgeActions}: HelloMenuProps) {
    const [nodes, setNodes] = useState<GraphNode[] | null>(null);
    const [edges, setEdges] = useState<GraphEdge[] | null>(null);

    const handleTest = () => {
        const gridMap = new Map<string, number>();
        gridMap.set(`${0},${0}`, 0 );
        gridMap.set(`${0},${1}`, 0 );
        gridMap.set(`${1},${0}`, 1);
        console.log("GridMap");
        console.log(gridMap);
        console.log("value inside");
        const value = gridMap.get(`${1},${0}`);
        console.log(value);
    }

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
            <CollapsibleSection title="MOTIVATION">
                <div className="lyrics">
                    I don't know what's going on {'\n'}
                    Most of the time I'm out my mind {'\n'}
                    A nervous wreck {'\n'}
                    I said, "Goodbye", and not "Hello" {'\n'}
                    Don't even know {'\n'}
                    {'\n'}
                    Felt a little fear and some anxiety {'\n'}
                    The second you arrived and kind of smiled at me {'\n'}
                    My heart began to rise {'\n'}
                    I panicked quietly, so silently {'\n'}
                    {'\n'}
                    I said, "Goodbye" before you came {'\n'}
                    I turned around and ran away {'\n'}
                    I was too scared, I should have said {'\n'}
                    "Hello, hello, hello, hello, hello, hello" {'\n'}
                    I said, "Goodbye" before you came {'\n'}
                    I turned around and ran away {'\n'}
                    I fеlt too scared, I should have said {'\n'}
                    "Hello, hеllo, hello, hello, hello, hello" {'\n'}
                </div>
            </CollapsibleSection>
            
            <button onClick={handleTest}> Teets</button>
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