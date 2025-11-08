import type { NodeType, Position } from "../../types/types";

export interface NodeGeneration {
    id: number; 
    x: number;
    y: number;
    type: NodeType;
}

export interface EdgeGeneration {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
}

export interface Graph {
    nodes: NodeGeneration[];
    edges: EdgeGeneration[];
};

export const FillingTypes = {
    // GENERIC
    RANDOM: "RANDOM",
    FULLY_CONNECTED: "FULLY_CONNECTED",
    //GRID
    NEIGHBORS_VH: "NEIGHBORS_VH",
    NEIGHBORS_VHD: "NEIGHBORS_VHD",
    // RING
    RING_NEIGHBORS: "RING_NEIGHBORS",
    RING_LATTICE: "RING_LATTICE",
    SMALL_WORLD: "SMALL_WORLD",
    SCALE_FREE: "SCALE_FREE",
    ERDOS_RENYI: "ERDOS_RENYI"

} as const;

export type FillingType = typeof FillingTypes[keyof typeof FillingTypes];

export interface BaseGenerationParams {
    spacing: number;
    useNoise: boolean;
    noisePercentage?: number;
    fillingType: FillingType;
    numberOfNodes: number;
    initialPosition: Position;
}

export function generateRandomEdges(nodes: NodeGeneration[]): EdgeGeneration[] {
    const edges: EdgeGeneration[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        let targetIndex: number;
        do {
            targetIndex = Math.floor(Math.random() * nodes.length);
        } while (targetIndex === i);

        edges.push({
            id: edges.length,
            sourceId: node.id,
            targetId: nodes[targetIndex].id,
            weight: 1, 
        });
    }
    return edges;
}

export function generateFullyConnectedEdges(nodes: NodeGeneration[]): EdgeGeneration[] {
    const edges: EdgeGeneration[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            edges.push({
                id: edges.length,
                sourceId: nodes[i].id,
                targetId: nodes[j].id,
                weight: 1,
            });
        }
    }
    
    return edges;
}

export function edgeExists(edges: EdgeGeneration[], sourceId: number, targetId: number): boolean {
    return edges.some(
        edge =>
            (edge.sourceId === sourceId && edge.targetId === targetId) ||
            (edge.sourceId === targetId && edge.targetId === sourceId)
    );
}

export function getDegree(edges: EdgeGeneration[], nodeId: number): number {
    return edges.filter(
            edge => edge.sourceId === nodeId || edge.targetId === nodeId
    ).length;
}