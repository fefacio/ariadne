import { DEFAULT_RADIUS_SIZE } from "../constants";
import type { Position } from "../types/types";
import type { GraphEdge, GraphNode } from "./SVGCanvas";

interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}
export function generateGridPositions(
    numberOfNodes: number, 
    spacing: number, 
    initialPosition: Position, 
    isNoise: boolean = false,
    noisePercentage: number = 50
): GraphNode[] {
    const positions: GraphNode[] = [];
    const gridSize: number = Math.ceil(Math.sqrt(numberOfNodes));

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const noiseValue = isNoise ? Math.random() * (noisePercentage/100 * spacing) : 0;
            positions.push({
                id: positions.length,
                cx: j*(2*DEFAULT_RADIUS_SIZE+spacing)+initialPosition.x + noiseValue,
                cy: i*(2*DEFAULT_RADIUS_SIZE+spacing)+initialPosition.y + noiseValue
            })
            if (positions.length === numberOfNodes) {
                return positions; 
            }
        }
    }
    return positions;
}

function generateRandomEdges(nodes: GraphNode[]): GraphEdge[] {
    const edges: GraphEdge[] = [];
    let edgeId = 0;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        let targetIndex: number;
        do {
            targetIndex = Math.floor(Math.random() * nodes.length);
        } while (targetIndex === i);

        edges.push({
            id: edgeId,
            sourceId: node.id,
            targetId: nodes[targetIndex].id,
            weight: 1, 
        });

        edgeId+=1;
    }
    return edges;

}

export function generateGrid(numberOfNodes: number, spacing: number = 10, initialPosition: Position = {x:0, y:0}){
    const positions: GraphNode[] = generateGridPositions(numberOfNodes, spacing, initialPosition);

    return positions;
    
}

export function generateGridRandom(numberOfNodes: number, spacing: number = 10, initialPosition: Position = {x:0, y:0}): Graph {
    const nodes: GraphNode[] = generateGridPositions(numberOfNodes, spacing, initialPosition);
    const edges: GraphEdge[] = generateRandomEdges(nodes);

    return {nodes: nodes, edges: edges}
}

export function generateRandom(count: number, width: number, height: number): Graph {
    const nodes: GraphNode[] = [];
    for (let i=0; i<count; i++){
        nodes.push({
            id: i,
            cx: Math.random() * width,
            cy: Math.random() * height
        })
    }
    const edges: GraphEdge[] = generateRandomEdges(nodes);

    return {nodes: nodes, edges: edges};
}