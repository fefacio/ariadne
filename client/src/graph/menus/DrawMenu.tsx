import { generateGridPositions } from "../generation/generationGrid";
import { generateRingPositions } from "../generation/generationRing";
import type { GraphNode } from "../SVGCanvas"
import type { NodeActions } from "../useGraphNodes"

interface DrawMenuProps {
    nodeList: GraphNode[];
    nodeActions: NodeActions;
    viewBox: { x: number, y: number, width: number, height: number };
};

export function DrawMenu({nodeList, nodeActions, viewBox}: DrawMenuProps) {
    const handleDrawRing = () => {
        const {nodes: ringPositions } = generateRingPositions(
            nodeList.length,
            10,
            {x: viewBox.x+40, y:viewBox.y+40},
            false
        );
        let i=0;
        for (const node of nodeList){
            nodeActions.updatePosition(node.id, {
                x: ringPositions[i].x, 
                y: ringPositions[i].y
            });
            i++;
        }
    }

    const handleDrawGrid = () => {
        const gridPositions = generateGridPositions(
            nodeList.length,
            100,
            {x: viewBox.x+40, y:viewBox.y+40},
            false
        );
        let i=0;
        for (const node of nodeList){
            nodeActions.updatePosition(node.id, {
                x: gridPositions[i].x, 
                y: gridPositions[i].y
            });
            i++;
        }
    }
    return (
        <div className="drawing">  
            <span className="drawing-method"> Drawing method</span>
            <div className="params-group">
                <span> Ring: </span>
                <button onClick={() => handleDrawRing()}> Draw Ring</button>
                <span> Grid: </span>
                <button onClick={() => handleDrawGrid()}> Draw Grid</button>
            </div>
            
            
            
        </div>
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