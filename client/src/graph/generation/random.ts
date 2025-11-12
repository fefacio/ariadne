import { NodeTypes } from "../../types";
import type { GraphEdge } from "../useGraphEdges";
import type { GraphNode } from "../useGraphNodes";
import type { EdgeGeneration, NodeGeneration } from "./generationUtils";


// *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
// |  RANDOM WEIGHT          |
// *-------------------------*

export interface RandomWeightParams {
    from: number;
    to: number;
    includeDecimalValues: boolean;
    fullRandom: boolean;
    numberOfEdges?: number;
    randomNumberOfEdges?: boolean;
}


function generateRandomWeight(from: number, to: number, includeDecimal: boolean): number {
    const random = Math.random() * (to - from) + from;
    return includeDecimal ? random : Math.round(random);
}


function selectRandomEdges(edges: GraphEdge[], count: number): GraphEdge[] {
    const shuffled = [...edges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, edges.length));
}


export function randomizeWeights(
    edges: GraphEdge[],
    params: RandomWeightParams
): Map<number, number> {
    const updatedWeights = new Map<number, number>();
    
    let edgesToUpdate: GraphEdge[];
    
    if (params.fullRandom) {
        edgesToUpdate = edges;
    } else {
        const count = params.randomNumberOfEdges 
            ? Math.floor(Math.random() * edges.length) + 1
            : params.numberOfEdges || 0;
        edgesToUpdate = selectRandomEdges(edges, count);
    }
    
    for (const edge of edgesToUpdate) {
        const newWeight = generateRandomWeight(
            params.from,
            params.to,
            params.includeDecimalValues
        );
        updatedWeights.set(edge.id, newWeight);
    }
    
    return updatedWeights;
}


// *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
// |  RANDOM NODE PARAMS     |
// *-------------------------*


export interface RandomNodeParams {
    randomizeConsumers: boolean;  
    consumerProbability: number;
    randomizeDemands: boolean;
    demandFrom: number;
    demandTo: number;
    includeDecimalDemands: boolean;
}

export function randomizeNodes(
    nodes: GraphNode[],
    params: RandomNodeParams
): { 
    types: Map<number, typeof NodeTypes.CONSUMER | typeof NodeTypes.NORMAL> | null,
    demands: Map<number, number> | null
} {
    const updatedTypes = params.randomizeConsumers 
        ? new Map<number, typeof NodeTypes.CONSUMER | typeof NodeTypes.NORMAL>() 
        : null;
    const updatedDemands = params.randomizeDemands ? new Map<number, number>() : null;
    
    for (const node of nodes) {
        if (params.randomizeConsumers && updatedTypes) {
            const random = Math.random();
            const newType = random < params.consumerProbability 
                ? NodeTypes.CONSUMER 
                : NodeTypes.NORMAL;
            updatedTypes.set(node.id, newType);
        }
        
        if (params.randomizeDemands && updatedDemands) {
            const isConsumer = updatedTypes 
                ? updatedTypes.get(node.id) === NodeTypes.CONSUMER
                : node.type === NodeTypes.CONSUMER;
                
            if (isConsumer) {
                const newDemand = generateRandomWeight(
                    params.demandFrom,
                    params.demandTo,
                    params.includeDecimalDemands
                );
                updatedDemands.set(node.id, newDemand);
            }
        }
    }
    
    return { types: updatedTypes, demands: updatedDemands };
}


// *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
// |  RANDOM EDGE TYPE       |
// *-------------------------*

export interface RandomEdgesParams {
    edgeProbability: number; 
    maxAttempts?: number;
}


function isGraphConnected(nodeIds: number[], edges: Array<{ sourceId: number; targetId: number }>): boolean {
    if (nodeIds.length === 0) return true;
    if (nodeIds.length === 1) return true;
    
    // Adjacency List  
    const adjacency = new Map<number, Set<number>>();
    for (const id of nodeIds) {
        adjacency.set(id, new Set());
    } 
    for (const edge of edges) {
        adjacency.get(edge.sourceId)?.add(edge.targetId);
        adjacency.get(edge.targetId)?.add(edge.sourceId);
    }
    
    const visited = new Set<number>();
    const queue: number[] = [nodeIds[0]];
    visited.add(nodeIds[0]);
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        
        for (const neighbor of adjacency.get(current) || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    
    return visited.size === nodeIds.length;
}


export function generateRandomEdges(
    nodes: GraphNode[] | NodeGeneration[],
    params: RandomEdgesParams
): EdgeGeneration[] {
    if (nodes.length < 2) return [];
    
    const { edgeProbability, maxAttempts = 100 } = params;
    const nodeIds = nodes.map(n => n.id);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const edges: EdgeGeneration[] = [];
        const edgeSet = new Set<string>(); 
        
        let edgeId=0;
        for (let i = 0; i < nodeIds.length; i++) {
            for (let j = i + 1; j < nodeIds.length; j++) {
                if (Math.random() < edgeProbability) {
                    const node1 = nodeIds[i];
                    const node2 = nodeIds[j];
                    const key = `${Math.min(node1, node2)}-${Math.max(node1, node2)}`;
                    
                    if (!edgeSet.has(key)) {
                        edges.push({ id: edgeId, sourceId: node1, targetId: node2, weight: 1 });
                        edgeSet.add(key);
                        edgeId+=1;
                    }
                }
            }
        }
        if (isGraphConnected(nodeIds, edges)) {
            console.log(`Generated ${edges.length} edges (connected on attempt ${attempt + 1})`);
            return edges;
        }
    }
    
    throw new Error(`Failed to generate connected graph after ${maxAttempts} attempts. Try increasing edge probability.`);
}