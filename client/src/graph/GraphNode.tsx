import React, { useRef } from "react";
import { Modes, NodeTypes, type Mode, type NodeType } from "../types/types";
import useViewBoxCoordinates from "../hooks/useViewBoxCoordinates";
import { DEFAULT_FACILITY_HEIGHT, DEFAULT_FACILITY_WIDTH } from "../constants";
import { getClusterColor } from "../colors";
import { NODE_STYLES, type NodeStyle } from "../styles";

type NodeProps = {
    nodeId: number;
    cx: number;
    cy: number;
    r: number;
    currentMode: Mode;
    nodeType: NodeType;
    nodeStyle: NodeStyle;
    clusterId?: number; 
    onPositionUpdate: (nodeId: number, newPosition: Position) => void;
};

interface Position {
    x: number;
    y: number;
};

export function GraphNode({nodeId, cx, cy, r, currentMode, nodeType, nodeStyle, clusterId, onPositionUpdate}: NodeProps) {
    const circleRef = useRef<SVGCircleElement>(null);
    const getViewBoxCoords = useViewBoxCoordinates(circleRef.current?.ownerSVGElement || null);
    const isDragging = useRef<boolean>(false);


    // const uiStateContext = useUIState();
    // const isEditMenuOpen = uiStateContext.isMenuOpen(MenuTypes.MENU_EDIT_NODE);
    // const editingNodeId = uiStateContext.getMenuMetadata(MenuTypes.MENU_EDIT_NODE)?.nodeId;
    const isSelectMode = currentMode === Modes.SELECT;

    const getFinalStyle = (): React.CSSProperties => {
        const baseStyle = nodeStyle ?? NODE_STYLES.DEFAULT;

        const style: React.CSSProperties = {
            fill: baseStyle.fill,
            stroke: baseStyle.stroke,
            strokeWidth: baseStyle.strokeWidth,
            cursor: isSelectMode ? 'grab' : 'pointer'
        };

        // Cluster color tem prioridade sobre fill
        if (clusterId !== undefined) {
            style.fill = getClusterColor(clusterId);
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
            onPositionUpdate(nodeId, {x:svgCoords.x, y:svgCoords.y});
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
        data-node-id={nodeId}
        data-cluster-id={clusterId}
        className={"node"}>  
            {nodeType ===  NodeTypes.CONSUMER && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={r+5}
                    style={finalStyle}
                />
            )}
            <circle
                ref={circleRef}
                cx={cx}
                cy={cy}
                r={r}
                data-node-id={nodeId}
                style={finalStyle}
        
            />
            {nodeType ===  NodeTypes.FACILITY && (
                <rect
                    x={cx-DEFAULT_FACILITY_WIDTH/2}
                    y={cy-DEFAULT_FACILITY_HEIGHT/2}
                    width={DEFAULT_FACILITY_WIDTH}
                    height={DEFAULT_FACILITY_HEIGHT}
                    style={{...finalStyle, userSelect: "none", pointerEvents: "none" }}
                />
            )}
            <text
                x={cx}
                y={cy}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="12"
                fill="black"
                style={{ userSelect: "none", pointerEvents: "none" }}
            > {nodeId.toString()}</text>
            

        </g>
    )
}
//"#c9e792ff",