import { DEFAULT_RADIUS_SIZE } from "../../constants";
import { NodeTypes, type Position } from "../../types/types";
import { edgeExists, FillingTypes, generateFullyConnectedEdges, generateRandomEdges, getDegree, type BaseGenerationParams, type EdgeGeneration, type FillingType, type Graph, type NodeGeneration } from "./generationUtils";


interface RingGenerationParams extends BaseGenerationParams {
    k?: number;
    probability?: number;
    m?: number;
    m0?: number;
}

function calculateCircleRadius(numberOfNodes: number, spacing: number): number {
    // Desired circunference = numberOfNodes * spacing * constants
    // C = 2πr =>  r = C / (2π)
    const desiredCircumference = 1.5*numberOfNodes * (2 * DEFAULT_RADIUS_SIZE + spacing);
    return desiredCircumference / (2 * Math.PI);
}

// *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
// |  GENERATE NODES         |
// *-------------------------*
export function generateRingPositions(
    numberOfNodes: number,
    spacing: number,
    initialPosition: Position,
    useNoise: boolean,
    noisePercentage: number = 50
): { nodes: NodeGeneration[], radius: number, center: Position } {
    const nodes: NodeGeneration[] = [];
    const radius = calculateCircleRadius(numberOfNodes, spacing);
    console.log("Generating ring positions for "+numberOfNodes+" nodes");
    // Centro do círculo (ajustado para que os nós fiquem visíveis)
    const center = {
        x: initialPosition.x + radius,
        y: initialPosition.y + radius
    };

    const angleStep = (2 * Math.PI) / numberOfNodes;

    for (let i = 0; i < numberOfNodes; i++) {
        const angle = i * angleStep;
        
        // Posição base no círculo
        let x = center.x + radius * Math.cos(angle);
        let y = center.y + radius * Math.sin(angle);

        // Aplica ruído se necessário
        if (useNoise) {
            const noiseAmount = (noisePercentage / 100) * spacing;
            x += (Math.random() - 0.5) * noiseAmount;
            y += (Math.random() - 0.5) * noiseAmount;
        }

        nodes.push({
            id: i,
            x,
            y,
            type: NodeTypes.NORMAL
        });
    }

    return { nodes, radius, center };
}


// *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
// |  GENERATE EDGES         |
// *-------------------------*
function generateRingNeighborsEdges(nodes: NodeGeneration[]): EdgeGeneration[] {
    // const edges: GraphEdge[] = [];
    // const n = nodes.length;

    // for (let i = 0; i < n; i++) {
    //     const nextIndex = (i + 1) % n;
    //     edges.push({
    //         id: edges.length,
    //         sourceId: nodes[i].id,
    //         targetId: nodes[nextIndex].id,
    //         weight: 1,
    //     });
    // }

    return generateRingLatticeEdges(nodes, 2);
}

function generateRingLatticeEdges(nodes: NodeGeneration[], k: number): EdgeGeneration[] {
    const edges: EdgeGeneration[] = [];
    const n = nodes.length;

    // Odd values are always rounded up down 
    const newK = Math.floor(k / 2) * 2;
    const neighborsPerSide = newK / 2;

    // Para cada nó, conecta aos k/2 vizinhos à direita
    for (let i = 0; i < n; i++) {
        for (let j = 1; j <= neighborsPerSide; j++) {
            const rightNeighbor = (i + j) % n;
            
            edges.push({
                id: edges.length,
                sourceId: nodes[i].id,
                targetId: nodes[rightNeighbor].id,
                weight: 1,
            });
        }
    }
    return edges;
}

function generateSmallWorldEdges(nodes: NodeGeneration[], k: number, rewireProb: number): EdgeGeneration[] {
    console.log("[WATTS] with p: "+rewireProb);
    const n = nodes.length;
    // Odd values are always rounded up down 
    const newK = Math.floor(k / 2) * 2;
    const neighborsPerSide = newK / 2;

    const edges: EdgeGeneration[] = generateRingLatticeEdges(nodes, k);
    for (let i=0; i<n; i++){
        for (let j=1; j<=neighborsPerSide; j++){
            const rightNeighbor = (i + j) % n;
            if (Math.random() < rewireProb){
                let newTarget: number;
                let attempts = 0;
                const maxAttempts = 100;
                
                do {
                    newTarget = Math.floor(Math.random() * n);
                    attempts++;
                    
                    // Condições para aceitar o novo target:
                    // 1. Não é o próprio nó (evita self-loop)
                    // 2. Edge ainda não existe (evita duplicata)
                    const isValid = 
                        newTarget !== i && 
                        !edgeExists(edges, nodes[i].id, nodes[newTarget].id);
                    
                    if (isValid) {
                        const edgeIndex = edges.findIndex(
                            edge => 
                                edge.sourceId === nodes[i].id && 
                                edge.targetId === nodes[rightNeighbor].id
                        );
                        if (edgeIndex !== -1) {
                            edges.splice(edgeIndex, 1);
                        }
                        edges.push({
                            id: edges.length,
                            sourceId: nodes[i].id,
                            targetId: nodes[newTarget].id,
                            weight: 1
                        })
                        
                        break;
                    }
                } while (attempts < maxAttempts);
            }
        }
    }
    return edges;
}

function generateScaleFreeEdges(nodes: NodeGeneration[], m: number, m0: number): EdgeGeneration[] {
    const edges: EdgeGeneration[] = [];
    const n = nodes.length;
    
    if (m < 1 || m >= n) {
        console.warn(`m (${m}) must be between 1 and ${n-1}. Using m=1`);
        m = 1;
    }

    if (m0 < 2 || m0 >= n) {
        console.warn(`m0 (${m0}) must be between 2 and ${n-1}. Using m0=${Math.max(2, Math.min(m0, n-1))}`);
        m0 = Math.max(2, Math.min(m0, n-1));
    }
    
    // 1. Creating complete graph from m0 nodes
    for (let i = 0; i < m0; i++) {
        for (let j = i + 1; j < m0; j++) {
            edges.push({
                id: edges.length,
                sourceId: nodes[i].id,
                targetId: nodes[j].id,
                weight: 1
            });
        }
    }
    
    const selectNodeByDegree = (availableNodes: number[]): number => {
        const degrees = availableNodes.map(nodeId => getDegree(edges, nodeId));
        const totalDegree = degrees.reduce((sum, deg) => sum + deg, 0);

        const probs: number[] = [];
        degrees.forEach(d => probs.push(d / totalDegree));

        const random = Math.random();
        let cumulative = 0;
        for (let i = 0; i < availableNodes.length; i++) {
            cumulative += probs[i];
            if (random <= cumulative) {
                return availableNodes[i];
            }
        }

        return availableNodes[availableNodes.length - 1];
    };
    
    // 2. Add remaining (n-m0) nodes and connect to m other nodes.
    for (let i = m0; i < n; i++) {
        const newNodeId = nodes[i].id;
        const selectedTargets: number[] = [];
        
        // Available nodes, for starters, its equal to the m0 nodes
        let availableNodes = nodes.slice(0, i).map(node => node.id);
        for (let j = 0; j < m && availableNodes.length > 0; j++) {
            const targetNodeId = selectNodeByDegree(availableNodes);
            
            if (!edgeExists(edges, newNodeId, targetNodeId)) {
                edges.push({
                    id: edges.length,
                    sourceId: newNodeId,
                    targetId: targetNodeId,
                    weight: 1
                });
                
                selectedTargets.push(targetNodeId);
            }
            
            availableNodes = availableNodes.filter(id => id !== targetNodeId);
        }
        
        console.log(`[SCALA-FREE] Node ${i} conecting to ${selectedTargets.length} nodes: [${selectedTargets.join(', ')}]`);
    }
    
    console.log(`[SCALE-FREE] Graph generated with ${n} nodes and ${edges.length} edges (m=${m})`);
    
    return edges;
}

function generateErdosRenyiEdges(nodes: NodeGeneration[], probability: number): EdgeGeneration[] {
    console.log("[ERDOS] with p: "+probability);
    const edges: EdgeGeneration[] = [];
    const n = nodes.length;
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (Math.random() < probability) {
                edges.push({
                    id: edges.length,
                    sourceId: nodes[i].id,
                    targetId: nodes[j].id,
                    weight: 1,
                });
            }
        }
    }
    
    
    const criticalP = Math.log(n) / n;
    if (probability < criticalP) {
        console.warn(`Low probability (${probability.toFixed(3)}) - graph may be disconnected! Critical p ≈ ${criticalP.toFixed(3)}`);
    }
    
    return edges;
}


function generateRingEdges(
    nodes: NodeGeneration[],
    fillingType: FillingType,
    k: number = 4,
    probability: number = 0.1,
    m: number = 2,
    m0: number = 3
): EdgeGeneration[] {
    switch (fillingType) {
        case FillingTypes.RING_NEIGHBORS:
            return generateRingNeighborsEdges(nodes);
        
        case FillingTypes.RING_LATTICE:
            console.log("Generating ring lattice with k: "+k);
            return generateRingLatticeEdges(nodes, k);
        
        case FillingTypes.SMALL_WORLD:
            return generateSmallWorldEdges(nodes, k, probability);

        case FillingTypes.SCALE_FREE:
            return generateScaleFreeEdges(nodes, m, m0);

        case FillingTypes.ERDOS_RENYI:
            return generateErdosRenyiEdges(nodes, probability);
        
        case FillingTypes.FULLY_CONNECTED:
            return generateFullyConnectedEdges(nodes);
        
        case FillingTypes.RANDOM:
            return generateRandomEdges(nodes);
        
        default:
            return generateRingNeighborsEdges(nodes);
    }
}

export function generateRing(params: RingGenerationParams): Graph {
    const {
        spacing,
        useNoise,
        noisePercentage = 50,
        fillingType,
        numberOfNodes,
        initialPosition,
        k = 4,
        probability = 0.1,
        m = 2,
        m0 = 3
    } = params;

    if (numberOfNodes < 3) {
        throw new Error("Circular graph needs at least 3 nodes");
    }
    console.log("!GENERATING! Ring with k "+k+" and nodeCount "+numberOfNodes);
    if (fillingType === FillingTypes.RING_LATTICE || 
        fillingType === FillingTypes.SMALL_WORLD && 
        k!== undefined && k >= numberOfNodes
    ) {
        console.warn(`k (${k}) should be less than node count (${numberOfNodes})`);
    }
    console.log("[PROB] prob: "+probability);

    const { nodes } = generateRingPositions(
        numberOfNodes,
        spacing,
        initialPosition,
        useNoise,
        noisePercentage
    );

    const edges = generateRingEdges(
        nodes,
        fillingType,
        k,
        probability,
        m,
        m0
    );

    return { nodes, edges };
}