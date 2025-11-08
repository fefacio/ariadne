// =====================================================
// RANDOM WEIGHT FUNCTIONS

import { NodeTypes } from "../../types/types";
import type { GraphEdge, GraphNode } from "../SVGCanvas";

// =====================================================
export interface RandomWeightParams {
    from: number;
    to: number;
    includeDecimalValues: boolean;
    fullRandom: boolean;
    numberOfEdges?: number;
    randomNumberOfEdges?: boolean;
}

/**
 * Gera um peso aleatório dentro do range especificado
 */
function generateRandomWeight(from: number, to: number, includeDecimal: boolean): number {
    const random = Math.random() * (to - from) + from;
    return includeDecimal ? random : Math.round(random);
}

/**
 * Seleciona aleatoriamente N edges únicos de uma lista
 */
function selectRandomEdges(edges: GraphEdge[], count: number): GraphEdge[] {
    const shuffled = [...edges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, edges.length));
}

/**
 * Randomiza pesos das arestas
 */
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

// =====================================================
// RANDOM NODE TYPE FUNCTIONS
// =====================================================

export interface RandomNodeTypeParams {
    consumerProbability: number; // 0 a 1 (0% a 100%)
}

/**
 * Randomiza tipos de nós baseado em probabilidade
 */
export function randomizeNodeTypes(
    nodes: GraphNode[],
    params: RandomNodeTypeParams
): Map<number, typeof NodeTypes.CONSUMER | typeof NodeTypes.NORMAL> {
    const updatedTypes = new Map<number, typeof NodeTypes.CONSUMER | typeof NodeTypes.NORMAL>();
    
    for (const node of nodes) {
        const random = Math.random();
        const newType = random < params.consumerProbability 
            ? NodeTypes.CONSUMER 
            : NodeTypes.NORMAL;
        updatedTypes.set(node.id, newType);
    }
    
    return updatedTypes;
}

// =====================================================
// RANDOM EDGES 
// =====================================================

export interface RandomEdgesParams {
    edgeProbability: number; // 0 a 1, probabilidade de criar cada aresta possível
    maxAttempts?: number; // máximo de tentativas para gerar grafo conexo
}

// VERIFY USING BFS
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
    nodes: GraphNode[],
    params: RandomEdgesParams
): Array<{ sourceId: number; targetId: number }> {
    if (nodes.length < 2) return [];
    
    const { edgeProbability, maxAttempts = 100 } = params;
    const nodeIds = nodes.map(n => n.id);
    console.log("CORRECT !!!!!!!!!!!");
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const edges: Array<{ sourceId: number; targetId: number }> = [];
        const edgeSet = new Set<string>(); 
        
        
        for (let i = 0; i < nodeIds.length; i++) {
            for (let j = i + 1; j < nodeIds.length; j++) {
                if (Math.random() < edgeProbability) {
                    const node1 = nodeIds[i];
                    const node2 = nodeIds[j];
                    const key = `${Math.min(node1, node2)}-${Math.max(node1, node2)}`;
                    
                    if (!edgeSet.has(key)) {
                        edges.push({ sourceId: node1, targetId: node2 });
                        edgeSet.add(key);
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