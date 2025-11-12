import React, { useRef } from "react";
import { NodeTypes, SvgModes, type SvgMode } from "../types";
import useViewBoxCoordinates from "../hooks/useViewBoxCoordinates";
import { DEFAULT_FACILITY_HEIGHT, DEFAULT_FACILITY_WIDTH } from "../constants";
import { getClusterColor } from "../colors";
import { NODE_STYLES } from "../styles";
import type { GraphNode } from "./useGraphNodes";

type GraphNodeProps = {
    node: GraphNode;
    r: number;
    currentMode: SvgMode;
    onPositionUpdate: (nodeId: number, newPosition: Position) => void;
};

interface Position {
    x: number;
    y: number;
};

export function Node({node, r, currentMode, onPositionUpdate}: GraphNodeProps) {
    const circleRef = useRef<SVGCircleElement>(null);
    const getViewBoxCoords = useViewBoxCoordinates(circleRef.current?.ownerSVGElement || null);
    const isDragging = useRef<boolean>(false);


    // const uiStateContext = useUIState();
    // const isEditMenuOpen = uiStateContext.isMenuOpen(MenuTypes.MENU_EDIT_NODE);
    // const editingNodeId = uiStateContext.getMenuMetadata(MenuTypes.MENU_EDIT_NODE)?.nodeId;
    const isSelectMode = currentMode === SvgModes.SELECT;

    const getFinalStyle = (): React.CSSProperties => {
        const baseStyle = node.style ?? NODE_STYLES.DEFAULT;

        const style: React.CSSProperties = {
            fill: baseStyle.fill,
            stroke: baseStyle.stroke,
            strokeWidth: baseStyle.strokeWidth,
            cursor: isSelectMode ? 'grab' : 'pointer'
        };


        if (node.clusterId !== undefined) {
            style.fill = getClusterColor(node.clusterId);
        }

        return style;
    };
    const finalStyle = getFinalStyle();

    
    const handleDragStart = (): void => {
        if (!isSelectMode) return;
    
        isDragging.current = true;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
    }

    const handleDrag = (event: MouseEvent): void => {
        if (isDragging.current){
            event.preventDefault();
            const svgCoords = getViewBoxCoords(event);
            onPositionUpdate(node.id, {x:svgCoords.x, y:svgCoords.y});
        }
    }

    const handleDragEnd = (): void => {
        isDragging.current = false;

        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    }

    return (
        <g 
        onMouseDown={handleDragStart}
        data-node
        data-node-id={node.id}
        data-cluster-id={node.clusterId}
        className={"node"}>  
            {node.type ===  NodeTypes.CONSUMER && (
                <circle
                    cx={node.x}
                    cy={node.y}
                    r={r+5}
                    style={finalStyle}
                />
            )}
            <circle
                ref={circleRef}
                cx={node.x}
                cy={node.y}
                r={r}
                data-node-id={node.id}
                style={finalStyle}
        
            />
            {node.type ===  NodeTypes.FACILITY && (
                <rect
                    x={node.x-DEFAULT_FACILITY_WIDTH/2}
                    y={node.y-DEFAULT_FACILITY_HEIGHT/2}
                    width={DEFAULT_FACILITY_WIDTH}
                    height={DEFAULT_FACILITY_HEIGHT}
                    style={{...finalStyle, userSelect: "none", pointerEvents: "none" }}
                />
            )}
            <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="12"
                fill="black"
                style={{ userSelect: "none", pointerEvents: "none" }}
            >
                {node.label}
                {node.demand && (
                    <tspan fill="red">{`(${node.demand})`}</tspan>
                )}
            </text>
            

        </g>
    )
}
//"#c9e792ff",