import { forceDirected } from "../drawing";
import type { GraphEdge, GraphNode } from "../SVGCanvas"
import type { NodeActions } from "../useGraphNodes"

interface DrawMenuProps {
    nodeList: GraphNode[];
    nodeActions: NodeActions;
    edgeList: GraphEdge[];
    viewBox: { x: number, y: number, width: number, height: number };
};

export function DrawMenu({nodeList, nodeActions, edgeList, viewBox}: DrawMenuProps) {
    const handleDraw = () => {
        const series = forceDirected(viewBox.width, viewBox.height, nodeList, edgeList, 1);
        const positions = series[series.length - 1].positions;
        console.log("U2"+positions);
        for (let i=0; i<positions.length; i++){
            console.log("ZDE"+positions[i].x+"ZZZ"+positions[i].y);
            nodeActions.updatePosition(nodeList[i].id, positions[i]);
        }
    }
    return (
        <>
            <p> Drawing </p>
            <button onClick={() => handleDraw()}> Draw forceDiercted</button>
        </>
    )
}

/*  (INSIDE DrawMenuContent)
    DropDownMenu -> Drawing Type (ForceDirected, KamadaKawai...)
    Ex: Selected ForceDirected
    Component(DrawingOptions)
        edgeLength:
        maxIterations:
        coolingFunctionStarterValue:

    (INSIDE DrawMenuContent)
    DropDownMenu -> Drawing Type (ForceDirected, KamadaKawai...)
    Ex: Selected KamadaKawai
    Component(DrawingOptions)
        factor:
        maxIterations:
        coolingFunctionStarterValue:
*/