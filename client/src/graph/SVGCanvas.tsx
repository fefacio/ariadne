// [TODO] Change GraphNode to {id: number, position: Position}?
// [CHECK] radial generation circle, clustering
import "./SVGCanvas.css";
import React, { useCallback, useEffect, useRef, useState} from "react";
//import useWindowDimensions from "../hooks/useWindowDimensions";

import { GraphNode } from './GraphNode'
import { MenuTypes, Modes, NodeTypes, type MenuType, type NodeType } from "../types/types";
import { DrawingTempState, EdgeCreation } from "./EdgeCreation";
import { GraphEdge } from "./GraphEdge";
import useViewBoxCoordinates from "../hooks/useViewBoxCoordinates";


// Custom Hooks
import { useGraphNodes } from "./useGraphNodes";
import { useGraphEdges } from "./useGraphEdges";
import { useSession } from "../context/session/useSession";
import { FloatingMenu } from "../components/FloatingMenu";
import { EditNodeMenu } from "./menus/EditNodeMenu";
import { DrawMenu } from "./menus/DrawMenu";
import { GenerateMenu } from "./menus/GenerateMenu";
import { DEFAULT_RADIUS_SIZE } from "../constants";
import { useUIState } from "../context/uiState/useUIState";
import { FileIOMenu } from "./menus/FileIOMenu";
import { SearchMenu } from "./menus/SearchMenu";
import { EditEdgeMenu } from "./menus/EditEdgeMenu";
import { ClusterMenu } from "./menus/ClusterMenu";
import { HelloMenu } from "./menus/HelloMenu";
import { StatsMenu } from "./menus/StatsMenu";
import { PMedianMenu } from "./menus/PMedianMenu";
import { INNER_EDGE_STYLES, NODE_STYLES, OUTER_EDGE_STYLES, type EdgeStyle, type NodeStyle } from "../styles";
import { AddParameters, type AddEdgeParams, type AddNodeParams } from "./AddParams";
import { ErrorMessage } from "./ErrorMessage";
import { RandomizerMenu } from "./menus/RandomizerMenu";
import { ResetMenu } from "./menus/ResetMenu";

export interface GraphNode  {
    id: number;
    x: number;
    y: number;
    type: NodeType;
    demand: number | null;
    style: NodeStyle;
    clusterId?: number;
};

export interface GraphEdge {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
    innerStyle: EdgeStyle;
    outerStyle: EdgeStyle;
};

interface TempEdge {
    nodeCx: number;
    nodeCy: number;
    mouseX: number;
    mouseY: number;
}


export function SVGCanvas() {
    // Contexts
    const sessionContext = useSession();
    const uiStateContext = useUIState();
    
    //const {currentWindowSize} = useWindowDimensions();
    const [, forceRender] = useState({});
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
    const {nodeList, setNodeList, nodeActions} = useGraphNodes(setEdgeList);
    const [addNodeParams, setAddNodeParams] = useState<AddNodeParams>({
        nodeType: NodeTypes.NORMAL,
        demand: 1.0
    });
    const [addEdgeParams, setAddEdgeParams] = useState<AddEdgeParams>({
        weight: 1.0
    })

    // SEARCH MENU AND STATS MENU STATE MANAGMENT
    const [sourceNodeId, setSourceNodeId] = useState<number | null>(null);
    const [targetNodeId, setTargetNodeId] = useState<number | null>(null);
    const [statsNodeId, setStatsNodeId] = useState<number | null>(null);
    const isSearchMenuOpen = uiStateContext.isMenuOpen(MenuTypes.MENU_SEARCH);
    useEffect(() => {
        if (!isSearchMenuOpen && sourceNodeId!==null && targetNodeId!==null) {
            setSourceNodeId(null);
            setTargetNodeId(null);
            uiStateContext.setSelectingNodeFor(null);
            nodeActions.resetStyles();
            edgeActions.resetStyles();
        }

        if (!uiStateContext.isMenuOpen(MenuTypes.MENU_STATS) && statsNodeId!==null){
            setStatsNodeId(null);
            uiStateContext.setSelectingNodeFor(null);
            nodeActions.resetStyles();
        }
    }, [edgeActions, isSearchMenuOpen, nodeActions, sourceNodeId, statsNodeId, targetNodeId, uiStateContext])

    // ERROR MESSAGE MANAGMENT
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);


    // EDITING NODE AND EDGE STYLE MANAGMENT
    const lastEditedNodeId = useRef<number | null>(null);
    const lastEditedEdgeId = useRef<number | null>(null);
    useEffect(() => {
        const editNodeMenu = uiStateContext.getMenuMetadata(MenuTypes.MENU_EDIT_NODE);
        const editEdgeMenu = uiStateContext.getMenuMetadata(MenuTypes.MENU_EDIT_EDGE);

        // EDIT NODE OPEN
        if (uiStateContext.isMenuOpen(MenuTypes.MENU_EDIT_NODE) && editNodeMenu?.nodeId !== undefined) {
            const currentNodeId = editNodeMenu.nodeId;
            
            if (lastEditedNodeId.current !== null && lastEditedNodeId.current !== currentNodeId) {
                nodeActions.resetStyle(lastEditedNodeId.current);
            }
            
            if (lastEditedNodeId.current !== currentNodeId) {
                nodeActions.updateStyle(currentNodeId, NODE_STYLES.EDITING);
                lastEditedNodeId.current = currentNodeId;
            }
        } 
        // EDIT NODE CLOSE
        else if (!uiStateContext.isMenuOpen(MenuTypes.MENU_EDIT_NODE)) {
            if (lastEditedNodeId.current !== null) {
                nodeActions.resetStyle(lastEditedNodeId.current);
                lastEditedNodeId.current = null;
            }
        }

        // EDIT EDGE OPEN
        if (uiStateContext.isMenuOpen(MenuTypes.MENU_EDIT_EDGE) && editEdgeMenu?.edgeId !== undefined) {
            const currentEdgeId = editEdgeMenu.edgeId;
            
            if (lastEditedEdgeId.current !== null && lastEditedEdgeId.current !== currentEdgeId) {
                edgeActions.resetStyle(lastEditedEdgeId.current);
            }
            
            if (lastEditedEdgeId.current !== currentEdgeId) {
                edgeActions.updateStyle(currentEdgeId, INNER_EDGE_STYLES.EDITING, true);
                edgeActions.updateStyle(currentEdgeId, OUTER_EDGE_STYLES.EDITING, false);
                lastEditedEdgeId.current = currentEdgeId;
            }
        }
        // EDIT EDGE CLOSE
        else if (!uiStateContext.isMenuOpen(MenuTypes.MENU_EDIT_EDGE)) {
            if (lastEditedEdgeId.current !== null) {
                edgeActions.resetStyle(lastEditedEdgeId.current);
                lastEditedEdgeId.current = null;
            }
        }
    }, [edgeActions, nodeActions, uiStateContext, uiStateContext.openMenuList]);

    // EDGE CREATION
    const [clickedCircle, setClickedCircle] = useState<GraphNode | null>(null);
    const edgeCreation = useRef(new EdgeCreation(
        svgRef, edgeActions.add
    )).current;

    useEffect(() => {
        edgeCreation.onEdgeComplete = edgeActions.add;

        const handleClickOutside = (event: MouseEvent) => {
            // Verifica se está no modo ADD_EDGE e no estado DrawingTempState
            if (sessionContext.currentMode === Modes.ADD_EDGE && 
                edgeCreation.getState() instanceof DrawingTempState) {
                
                const target = event.target as HTMLElement;
                
                // Verifica se o clique foi fora do SVG
                if (!svgRef.current?.contains(target)) {
                    console.log("Clicked outside canvas - canceling edge creation");
                    edgeCreation.clickEmpty();
                    forceRender({});
                }
            }
        };

        // Adiciona listener ao documento
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sessionContext.currentMode, edgeCreation, forceRender, edgeActions.add]);

    // *-----------------------------*
    // |                             |
    // |   HANDLE CLICK ON CANVAS    |
    // |                             |
    // *-----------------------------*
    
    const handleClickSVGCanvas = async (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        for (const edge of edgeList){
            console.log(edge.id+" s "+edge.sourceId+" t "+edge.targetId+" w "+edge.weight);
        }
        console.log("UNIQUE EDGES")
        console.log(edgeActions.getUnique())

        setMouseCoords({x:event.clientX, y:event.clientY});
        const svgCoords = getViewBoxCoords(event);
        setSvgCoords(svgCoords);

        const clickedElement= event.target as SVGElement;
        const edgeGroup = clickedElement.closest("[data-edge]");
        console.log("EDGE-GROUP");
        console.log(edgeGroup);
        console.log("EDGES");
        console.log(edgeList)

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
            const demandValue = addNodeParams.nodeType === NodeTypes.CONSUMER 
                ? addNodeParams.demand 
                : null;
            nodeActions.add(svgCoords.x, svgCoords.y, addNodeParams.nodeType, demandValue);
        }

        if (sessionContext.currentMode===Modes.ADD_EDGE){
            if (clickedElement.tagName === "circle") {
                try {
                    await edgeCreation.clickCircle(clickedElement as SVGCircleElement, addEdgeParams.weight);
                } catch (error) {
                    if (error instanceof Error) {
                        console.log("DANCE UNTIL IM DEAD");
                        setErrorMessage(error.message);
                        console.log("New error message:", error.message);
                    }
                }
            } else {
                edgeCreation.clickEmpty();
                forceRender({});
            }
        }

        for (const edge of edgeList){
            console.log("edge: "+edge.id);

        }
        if (sessionContext.currentMode===Modes.DELETE) {
            if (clickedElement.tagName == "circle") {
                const circleElement = clickedElement as SVGCircleElement;
                const circleId = Number(circleElement.getAttribute("data-node-id"));
                nodeActions.delete(circleId);
            }
            if (edgeGroup){
                const edgeId = Number(edgeGroup.getAttribute("data-edge-id"));
                const edge = edgeActions.getById(edgeId);
                edgeActions.delete(edge.sourceId, edge.targetId);
            }
        }

        if (sessionContext.currentMode===Modes.EDIT){
            if (clickedElement.parentElement?.hasAttribute("data-node")){
                const circleElement = clickedElement as SVGCircleElement;
                const circleId = Number(circleElement.getAttribute("data-node-id"));
                nodeActions.updateStyle(circleId, NODE_STYLES.EDITING);
                uiStateContext.addMenu(MenuTypes.MENU_EDIT_NODE, {nodeId: circleId});
            }

            if (edgeGroup){
                const edgeId = Number(edgeGroup.getAttribute("data-edge-id"));
                console.log("Edge ID clicked:", edgeId);
                edgeActions.updateStyle(edgeId, INNER_EDGE_STYLES.EDITING, true);
                edgeActions.updateStyle(edgeId, OUTER_EDGE_STYLES.EDITING, false);
                uiStateContext.addMenu(MenuTypes.MENU_EDIT_EDGE, { edgeId: edgeId });
            }
        }

        if (sessionContext.currentMode === Modes.SELECT_NODE) {
            
            if (clickedElement.tagName === "circle" || clickedElement.parentElement?.hasAttribute("data-node")) {
                const nodeElement = clickedElement as SVGCircleElement;
                const nodeId = nodeElement?.getAttribute('data-node-id');
                
                if (nodeId && uiStateContext.selectingNodeFor) {
                    const id = parseInt(nodeId);
                    
                    if (uiStateContext.selectingNodeFor === "source") {
                        setSourceNodeId(id);
                        nodeActions.updateStyle(id, NODE_STYLES.SELECTING);
                    } else if (uiStateContext.selectingNodeFor === "target") {
                        setTargetNodeId(id);
                        nodeActions.updateStyle(id, NODE_STYLES.SELECTING);
                    } else if (uiStateContext.selectingNodeFor === "stats") {
                        setStatsNodeId(id);
                        nodeActions.updateStyle(id, NODE_STYLES.SELECTING);
                    }
                    
                    // Volta ao modo SELECT e limpa o estado
                    sessionContext.setMode(Modes.SELECT);
                    uiStateContext.setSelectingNodeFor(null);
                }
            }
        }

        
    }

    // *----------------------------------------*
    // |                                        |
    // |    MANAGE OPEN MENUS                   |
    // |                                        |
    // *----------------------------------------*
    const menuConfig: Record<MenuType, { title: string; content: React.ReactNode; }> = {
        MENU_HELLO: {
            title: "Hello",
            content: <HelloMenu nodeActions={nodeActions} edgeActions={edgeActions}/>
        },
        MENU_EDIT_NODE: { 
            title: "Edit Node", 
            content: <></> 
        },
        MENU_EDIT_EDGE: { 
            title: "Edit Edge", 
            content: <></> 
        },
        MENU_RESET: {
            title: "Reset states",
            content: <ResetMenu nodeActions={nodeActions} edgeActions={edgeActions}/>
        },
        MENU_DRAW: { 
            title: "Draw Options", 
            content: <DrawMenu nodeList={nodeList} nodeActions={nodeActions} viewBox={viewBox} /> 
        },
        MENU_GENERATE: { 
            title: "Generate Graph", 
            content: <GenerateMenu addNode={nodeActions.add} addEdge={edgeActions.add} viewBox={viewBox}/> 
        },
        MENU_RANDOMIZER: {
            title: "Randomizer",
            content: <RandomizerMenu 
                nodeList={nodeList}
                edgeList={edgeList}
                nodeActions={nodeActions}
                edgeActions={edgeActions}/>
        },
        MENU_FILE_IO: {
            title: "File",
            content: <FileIOMenu 
                nodeList={nodeList} 
                edgeActions={edgeActions}
                setNodeList={setNodeList} 
                setEdgeList={setEdgeList}/>
        },
        MENU_SEARCH: {
            title: "Search",
            content: <SearchMenu 
                sourceNodeId={sourceNodeId} 
                targetNodeId={targetNodeId}
                updateStyle={nodeActions.updateStyle}
                resetStyles={nodeActions.resetStyles}
                edgeActions={edgeActions}
                />
        },
        MENU_CLUSTER: {
            title: "Cluster",
            content: <ClusterMenu nodeActions={nodeActions}/>
        },
        MENU_STATS: {
            title: "Statistics",
            content: <StatsMenu 
                statsNodeId={statsNodeId} 
                resetStyles={nodeActions.resetStyles}
                setErrorMessage={setErrorMessage}
                />
        },
        MENU_PMEDIAN: {
            title: "P-Median",
            content: <PMedianMenu/>
        }
    };

    const openMenuComponents = uiStateContext.openMenuList.map(openMenu => {
        const config = menuConfig[openMenu.type];
        let content: React.ReactNode;
        console.log("OPEN MENU TYPE");
        console.log(openMenu.type);

        if (openMenu.type===MenuTypes.MENU_EDIT_NODE){
            const nodeId = openMenu.metadata?.nodeId;
            if (!nodeId) {
                return null
            }
            content = <EditNodeMenu nodeId={nodeId} nodeActions={nodeActions}/>
        } else if (openMenu.type===MenuTypes.MENU_EDIT_EDGE){
            const edgeId = openMenu.metadata?.edgeId;
            if (!edgeId) {
                return null
            }
            content = <EditEdgeMenu edgeId={edgeId} edgeActions={edgeActions}/>
        } else {
            content = config.content
        }
        return (
            <FloatingMenu key={openMenu.id} title={config.title} type={openMenu.type}>
                {content}
            </FloatingMenu>
        )
    })

    

    const nodeComponents = nodeList.map(node => 
        <GraphNode 
            key={node.id}
            nodeId={node.id} 
            cx={node.x} 
            cy={node.y} 
            r={DEFAULT_RADIUS_SIZE}
            currentMode={sessionContext.currentMode}
            nodeType={node.type}
            nodeStyle={node.style}
            clusterId={node.clusterId}
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

    
    const edgeComponents = useCallback(() => {
        const uniqueEdges = edgeActions.getUnique();
        return uniqueEdges.map(edge => 
            <GraphEdge 
                key={edge.id}
                edgeId={edge.id}
                nodeList={nodeList} 
                node1Id={edge.sourceId} 
                node2Id={edge.targetId}
                weight={edge.weight}
                edgeInnerStyle={edge.innerStyle || INNER_EDGE_STYLES.DEFAULT}
                edgeOuterStyle={edge.outerStyle || OUTER_EDGE_STYLES.DEFAULT}
            />
        )
    },
    [edgeActions, nodeList])

    return (
        <div className="svgCanvas">
            {(sessionContext.currentMode === Modes.ADD_NODE || 
                sessionContext.currentMode === Modes.ADD_EDGE) && (
                <AddParameters 
                    currentMode={sessionContext.currentMode}
                    addNodeParams={addNodeParams}
                    setAddNodeParams={setAddNodeParams}
                    addEdgeParams={addEdgeParams}
                    setAddEdgeParams={setAddEdgeParams}
                />
            )}
            {errorMessage!==null && (
                <ErrorMessage 
                    message={errorMessage} 
                    setErrorMessage={setErrorMessage}
                />
            )}
            
            {/* <p> {currentWindowSize.width} {currentWindowSize.height}</p> */}
            <p> <span style={{background: "rgba(184, 159, 159, 1)"}}>mouseCoords: </span>{mouseCoords.x.toFixed(2)} {mouseCoords.y.toFixed(2)}</p>
            <p> <span style={{background: "rgba(247, 232, 150, 1)"}}>svgCoords: </span> {svgCoords.x.toFixed(2)} {svgCoords.y.toFixed(2)}</p>
            <p>
            {clickedCircle && (
                <>
                <span style={{ background: "rgba(1, 255, 107, 1)" }}>Clicked Circle:</span>{" "}
                {clickedCircle.x} | {clickedCircle.y} | ID: {clickedCircle.id}
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
            {openMenuComponents}
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
                    x={viewBox.x} 
                    y={viewBox.y} 
                    width={viewBox.width*3} 
                    height={viewBox.height*3}
                    fill="url(#grid-advanced)"
                    style={{
                        pointerEvents: "none",
                    }} />
                
                {edgeComponents()}
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
