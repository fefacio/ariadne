import React, { useRef, useState } from "react";
import { Modes, type Mode } from "../types/types";
import useViewBoxCoordinates from "../hooks/useViewBoxCoordinates";

type NodeProps = {
    nodeId: number;
    cx: number;
    cy: number;
    r: number;
    currentMode: Mode;
    onPositionUpdate: (nodeId: number, newPosition: Position) => void;
};

interface Position {
    x: number;
    y: number;
};

export function GraphNode({nodeId, cx, cy, r, currentMode, onPositionUpdate}: NodeProps) {
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
        <>  
            <circle
                ref={circleRef}
                data-node-id={nodeId}
                cx={cx}
                cy={cy}
                r={r}
                onMouseDown={handleDragStart}

                className={`node${isSelectMode ? '-selected' : ''}`}
                style={{...nodeStyle}}
            />
        </>
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