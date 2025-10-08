import React, { useRef, useState } from "react";
import { Modes, NodeTypes, type Mode, type NodeType } from "../types/types";
import useViewBoxCoordinates from "../hooks/useViewBoxCoordinates";

type NodeProps = {
    nodeId: number;
    cx: number;
    cy: number;
    r: number;
    currentMode: Mode;
    nodeType: NodeType;
    onPositionUpdate: (nodeId: number, newPosition: Position) => void;
};

interface Position {
    x: number;
    y: number;
};

export function GraphNode({nodeId, cx, cy, r, currentMode, nodeType, onPositionUpdate}: NodeProps) {
    const circleRef = useRef<SVGCircleElement>(null);
    const getViewBoxCoords = useViewBoxCoordinates(circleRef.current?.ownerSVGElement || null);
    const isDragging = useRef<boolean>(false);
    const [nodeStyle, setNodeStyle] = useState<React.CSSProperties>({
        fill: "#c9e792ff",
        stroke: "black",
        strokeWidth: 2
    })


    const isSelectMode = currentMode === Modes.SELECT;
    const handleDragStart = (): void => {
        if (!isSelectMode) return;
    
        setNodeStyle(prev => ({
            ...prev,
            stroke: "red",
        }));

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

        setNodeStyle(prev => ({
            ...prev,
            stroke: "black",
        }));

        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    }
    
    return (
        <g 
        onMouseDown={handleDragStart}
        data-node
        data-node-id={nodeId}
        className={"node"}>  
            {nodeType ===  NodeTypes.CONSUMER && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={r+5}
                    style={{...nodeStyle}}
                />
            )}
            <circle
                ref={circleRef}
                cx={cx}
                cy={cy}
                r={r}
                data-node-id={nodeId}
                style={{...nodeStyle}}
            />
            

        </g>
    )
}
/*
    main 
        lefttools
        upperbar
        righttools
        mainwindow(graph-svg)
            node
            edge

*/