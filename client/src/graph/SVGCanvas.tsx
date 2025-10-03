// [TODO] Change GraphNode to {id: number, position: Position}?

import "./SVGCanvas.css";
import React, { useCallback, useRef, useState} from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";

import { GraphNode } from './GraphNode'
import { Modes, type MenuType } from "../types/types";
import { DrawingTempState, EdgeCreation } from "./EdgeCreation";
import { GraphEdge } from "./GraphEdge";
import useViewBoxCoordinates from "../hooks/useViewBoxCoordinates";


// Custom Hooks
import { useGraphNodes } from "./useGraphNodes";
import { useGraphEdges } from "./useGraphEdges";
import { useSession } from "../context/session/useSession";
import { FloatingMenu } from "../components/FloatingMenu";
import { NodeMenuContent } from "./menus/NodeMenuContent";
import { DrawMenuContent } from "./menus/DrawMenuContent";
import { GenerateMenuContent } from "./menus/GenerateMenuContent";
import { DEFAULT_RADIUS_SIZE } from "../constants";

export interface GraphNode  {
    id: number;
    cx: number;
    cy: number;
};

export interface GraphEdge {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
};

interface TempEdge {
    nodeCx: number;
    nodeCy: number;
    mouseX: number;
    mouseY: number;
}


export function SVGCanvas() {
    const sessionContext = useSession();
    
    const {currentWindowSize} = useWindowDimensions();
    const [mouseCoords, setMouseCoords] = useState({x:0, y:0});
    const [svgCoords, setSvgCoords] = useState({x:0, y:0});
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 500, height: 500 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });




    //const svgElementRef = useRef<SVGSVGElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const getViewBoxCoords = useViewBoxCoordinates(svgRef.current);
    

    const handleMouseMove = useCallback(
        (event: React.MouseEvent<SVGSVGElement>) => {
            if (edgeCreation.getState() instanceof DrawingTempState) {
                setMouseCoords({x:event.clientX, y:event.clientY});
                setSvgCoords(getViewBoxCoords(event));
            }
            

            if (isPanning && sessionContext.currentMode===Modes.SELECT) {
                const coords = getViewBoxCoords(event)
                console.log("ok")
                console.log("ViewBox antes:", viewBox);
                setViewBox(prev => ({
                    ...prev,
                    x: prev.x - (coords.x - lastPanPoint.x),
                    y: prev.y - (coords.y - lastPanPoint.y)
                }));
                console.log("ViewBox atual:", viewBox);
            }
            //console.log("AA"+svgCoords.x+"A2"+svgCoords.y);
        },
        [isPanning, sessionContext.currentMode, getViewBoxCoords, lastPanPoint]
    )

    const handleMouseDown = useCallback(
        (event: React.MouseEvent<SVGSVGElement>) => {
            const clickedElement= event.target as SVGElement;
            if (event.button === 0 && clickedElement.tagName === "svg") {
                setIsPanning(true);
                setLastPanPoint(getViewBoxCoords(event));
            }   
        },
        [getViewBoxCoords]
    )

    const handleMouseUp = useCallback(
        (event: React.MouseEvent<SVGSVGElement>) => {
            if (event.button === 0) {
                setIsPanning(false);
            }   
        },
        []
    )

    const handleWheel = useCallback(
        (event: React.WheelEvent<SVGSVGElement>) => {
            const zoomFactor = 0.2;
            const zoomIn = event.deltaY < 0;
            console.log("deltayY:" +event.deltaY);
            const scale = zoomIn ? (1 - zoomFactor) : (1 + zoomFactor);
            const svgCoords = getViewBoxCoords(event);

            setViewBox(prev => {
                const newWidth = prev.width * scale;
                const newHeight = prev.height * scale;

                return {
                    x: svgCoords.x - (svgCoords.x - prev.x) * scale,
                    y: svgCoords.y - (svgCoords.y - prev.y) * scale,
                    width: newWidth,
                    height: newHeight
                };
            });
        },
        [getViewBoxCoords]
    )

    
    
    const {edgeList, setEdgeList, edgeActions} = useGraphEdges();
    const {nodeList, nodeActions} = useGraphNodes(setEdgeList);
    



    const [clickedCircle, setClickedCircle] = useState<GraphNode | null>(null);
    const edgeCreation = useRef(new EdgeCreation(
        svgRef, edgeActions.add
    )).current;

    
    
    const [, forceRender] = useState({});
    const handleClickSVGCanvas = (event: React.MouseEvent<SVGSVGElement>) => {
        console.log(sessionContext.openMenu+"AAA");
        if (!svgRef.current) return;

        setMouseCoords({x:event.clientX, y:event.clientY});
        const svgCoords = getViewBoxCoords(event);
        setSvgCoords(svgCoords);

        const clickedElement= event.target as SVGElement;
        
        console.log('Clicou em:', clickedElement.tagName);
        if (sessionContext.currentMode===Modes.SELECT){
            if (clickedElement.tagName === "circle"){
                const circleElement = clickedElement as SVGCircleElement;
                const circleId = Number(circleElement.getAttribute("data-node-id"));
                if (!circleId) return;

                const clickedNode = nodeList.find(node => node.id === circleId);
                if (!clickedNode) return;

                setClickedCircle(clickedNode);

            }
        }
        

        if (sessionContext.currentMode===Modes.ADD_NODE) {
            console.log(svgCoords);
            nodeActions.add(svgCoords.x, svgCoords.y);
        }

        if (sessionContext.currentMode===Modes.ADD_EDGE){
            if (clickedElement.tagName === "circle") {
                edgeCreation.clickCircle(clickedElement as SVGCircleElement);
            } else {
                edgeCreation.clickEmpty();
                forceRender({});
            }
            
            
        }

        if (sessionContext.currentMode===Modes.DELETE) {
            if (clickedElement.tagName == "circle") {
                const circleElement = clickedElement as SVGCircleElement;
                const circleId = Number(circleElement.getAttribute("data-node-id"));
                nodeActions.delete(circleId);
            }
            
        }
    }

    const menuConfig: Record<MenuType, { title: string; content: React.ReactNode; }> = {
        MENU_NODE: { 
            title: "Node", 
            content: <NodeMenuContent /> 
        },
        MENU_DRAW: { 
            title: "Draw Options", 
            content: <DrawMenuContent nodeList={nodeList} nodeActions={nodeActions} edgeList={edgeList} viewBox={viewBox} /> 
        },
        MENU_GENERATE: { 
            title: "Generate Graph", 
            content: <GenerateMenuContent addNode={nodeActions.add} addEdge={edgeActions.add} svgRef={svgRef} viewBox={viewBox}/> 
        }
    };

    

    const nodeComponents = nodeList.map(node => 
        <GraphNode 
            key={node.id}
            nodeId={node.id} 
            cx={node.cx} 
            cy={node.cy} 
            r={DEFAULT_RADIUS_SIZE}
            currentMode={sessionContext.currentMode}
            onPositionUpdate={nodeActions.updatePosition}/>
    )

    const TempEdgeConnection = ({nodeCx, nodeCy, mouseX, mouseY}: TempEdge ) => {
        return (
            <line 
                x1={nodeCx} 
                y1={nodeCy} 
                x2={mouseX} 
                y2={mouseY}
                style={{
                    stroke: "black",
                    strokeWidth: 10,
                    strokeOpacity: 0.5,
                    pointerEvents: "none"
                }}/>
        )
    }

    const edgeComponents = edgeList.map(edge => 
        <GraphEdge 
            key={edge.id}
            edgeId={edge.id}
            nodeList={nodeList} 
            node1Id={edge.sourceId} 
            node2Id={edge.targetId} 
        />
    )

    return (
        <div className="svgCanvas">
            <p> {currentWindowSize.width} {currentWindowSize.height}</p>
            <p> <span style={{background: "rgba(184, 159, 159, 1)"}}>mouseCoords: </span>{mouseCoords.x.toFixed(2)} {mouseCoords.y.toFixed(2)}</p>
            <p> <span style={{background: "rgba(247, 232, 150, 1)"}}>svgCoords: </span> {svgCoords.x.toFixed(2)} {svgCoords.y.toFixed(2)}</p>
            <p>
            {clickedCircle && (
                <>
                <span style={{ background: "rgba(1, 255, 107, 1)" }}>Clicked Circle:</span>{" "}
                {clickedCircle.cx} | {clickedCircle.cy}
                </>
            )}
            </p>
            <p> ViewBox Coords 
                x:{viewBox.x.toFixed(2)} |
                y:{viewBox.y.toFixed(2)} |
                width:{viewBox.width.toFixed(2)} |
                height:{viewBox.height.toFixed(2)} |
            </p>
            <p style={{background: "yellow"}}> {sessionContext.currentMode} </p>
            {sessionContext.openMenu && menuConfig[sessionContext.openMenu] && (
                    <FloatingMenu title={menuConfig[sessionContext.openMenu].title}>
                        {menuConfig[sessionContext.openMenu].content}
                    </FloatingMenu>

                )}
            <svg version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width={800}
                height={600}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                preserveAspectRatio="xMinYMin meet"
                ref={svgRef}
                onClick={(e) => handleClickSVGCanvas(e)}
                onMouseDown={(e) => handleMouseDown(e)}
                onMouseMove={(e) => handleMouseMove(e)}
                onMouseUp={(e) => handleMouseUp(e)}
                onWheel={(e) => handleWheel(e)}
                >

                
    
                <defs>
                    <pattern id="grid-advanced" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#8ff97cff" strokeWidth="3"/>
                    </pattern>
                </defs> 
                <rect 
                    x={viewBox.x - 1000} 
                    y={viewBox.y - 1000} 
                    width="2000" 
                    height="2000" 
                    fill="url(#grid-advanced)"
                    style={{
                        pointerEvents: "none",
                    }} />
                
                {edgeComponents}
                {nodeComponents}

                {edgeCreation.getState() instanceof DrawingTempState  ?
                    <TempEdgeConnection
                        nodeCx={edgeCreation.getSourceNodePosition()!.x}
                        nodeCy={edgeCreation.getSourceNodePosition()!.y}
                        mouseX={svgCoords.x}
                        mouseY={svgCoords.y}
                    />   
                    : null
                }

                
                
                
            </svg>
            
        </div>
    
    )
}
