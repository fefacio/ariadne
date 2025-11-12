import { useMemo } from "react";
import { type EdgeStyle } from "../styles";
import type { GraphNode } from "./useGraphNodes";

interface EdgeProps {
    edgeId: number;
    nodeList: GraphNode[];
    node1Id: number;
    node2Id: number;
    weight: number;
    edgeInnerStyle: EdgeStyle;
    edgeOuterStyle: EdgeStyle;
};

export function Edge({edgeId, nodeList, node1Id, node2Id, weight, edgeInnerStyle, edgeOuterStyle}: EdgeProps){
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

    // const getFinalStyle = (): React.CSSProperties => {
    //     const baseStyle = edgeStyle ?? EDGE_STYLES.DEFAULT;

    //     const style: React.CSSProperties = {
    //         stroke: baseStyle.stroke,
    //         strokeWidth: baseStyle.strokeWidth,
    //     };

    //     return style;
    // };
    
    // const finalStyle = getFinalStyle();

    return (
        <g
        data-edge
        data-edge-id={edgeId}
        className={"edge"}>
            <path d={
                `M${node1.x} ${node1.y} L${node2.x} ${node2.y}`
            }
            opacity={0.2}
            stroke={edgeOuterStyle.stroke}
            strokeWidth={edgeOuterStyle.strokeWidth}
            data-edge-id={edgeId}
            />
            <path d={
                `M${node1.x} ${node1.y} L${node2.x} ${node2.y}`
            }
            opacity={0.5}
            data-edge-id={edgeId}
            style={edgeInnerStyle}
            />
            <text
                x={(node2.x+node1.x)/2+10}
                y={(node2.y+node1.y)/2+10}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                fill="black"
                style={{ userSelect: "none", pointerEvents: "none" }}
            > {weight}
            </text>
        </g>
        
    )
}