import { useMemo, useState } from "react";
import type { GraphNode } from "./SVGCanvas";

interface EdgeProps {
    edgeId: number;
    nodeList: GraphNode[];
    node1Id: number;
    node2Id: number; 
};

export function GraphEdge({edgeId, nodeList, node1Id, node2Id}: EdgeProps){
    const [edgeStyle ] = useState<React.CSSProperties>({
            fill: "none",
            stroke: "black",
            strokeWidth: 4
    })

    const { node1, node2 } = useMemo(() => {
        let foundNode1 = null;
        let foundNode2 = null;
        
        for (const node of nodeList) {
            if (node.id === node1Id) foundNode1 = node;
            if (node.id === node2Id) foundNode2 = node;
            
            if (foundNode1 && foundNode2) break;
        }
        
        return { node1: foundNode1, node2: foundNode2 };
    }, [nodeList, node1Id, node2Id]);

    if (!node1 || !node2) {
        return null;
    }

    return (
        <>
            <path d={
                `M${node1.cx} ${node1.cy} L${node2.cx} ${node2.cy}`
            }
            data-edge-id={edgeId}
            style={{...edgeStyle}}
            />
        </>
        
    )
}