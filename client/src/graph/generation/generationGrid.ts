import { DEFAULT_RADIUS_SIZE } from "../../constants";
import { NodeTypes, type Position } from "../../types";
import { FillingTypes, generateFullyConnectedEdges, type BaseGenerationParams, type EdgeGeneration, type FillingType, type Graph, type NodeGeneration } from "./generationUtils";
import { generateRandomEdges } from "./random";



export const GridTypes = {
    SQUARE: "SQUARE",
    RECTANGULAR: "RECTANGULAR"
} as const;

export type GridType = typeof GridTypes[keyof typeof GridTypes];

interface GridGenerationParams extends BaseGenerationParams {
    gridType: GridType;
    gridSize?: number;
    rows?: number;
    columns?: number;
    edgeProbability: number;
    maxAttempts: number;
};


function applyNoise(value: number, spacing: number, noisePercentage: number): number {
    return value + Math.random() * (noisePercentage / 100 * spacing);
}

function createNode(id: number, row: number, col: number, spacing: number, initialPosition: Position, useNoise: boolean, noisePercentage: number): NodeGeneration {
    const baseX = col * (2 * DEFAULT_RADIUS_SIZE + spacing) + initialPosition.x;
    const baseY = row * (2 * DEFAULT_RADIUS_SIZE + spacing) + initialPosition.y;

    return {
        id,
        x: useNoise ? applyNoise(baseX, spacing, noisePercentage) : baseX,
        y: useNoise ? applyNoise(baseY, spacing, noisePercentage) : baseY,
        type: NodeTypes.NORMAL
    };
}


function createGridMap(nodes: NodeGeneration[], cols: number): Map<string, NodeGeneration> {
    const gridMap = new Map<string, NodeGeneration>();
    nodes.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        gridMap.set(`${row},${col}`, node);
    });
    return gridMap;
}

// NODE POSITIONS
export function generateGridPositions(
    numberOfNodes: number, 
    spacing: number, 
    initialPosition: Position, 
    isNoise: boolean = false,
    noisePercentage: number = 50
): NodeGeneration[] {
    const positions: NodeGeneration[] = [];
    const gridSize: number = Math.ceil(Math.sqrt(numberOfNodes));

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const noiseValue = isNoise ? Math.random() * (noisePercentage/100 * spacing) : 0;
            positions.push({
                id: positions.length,
                x: j*(2*DEFAULT_RADIUS_SIZE+spacing)+initialPosition.x + noiseValue,
                y: i*(2*DEFAULT_RADIUS_SIZE+spacing)+initialPosition.y + noiseValue,
                type: NodeTypes.NORMAL
            })
            if (positions.length === numberOfNodes) {
                return positions; 
            }
        }
    }
    return positions;
}


function generateRectangularPositions(
    rows: number,
    cols: number,
    numberOfNodes: number,
    spacing: number,
    initialPosition: Position,
    useNoise: boolean,
    noisePercentage: number
): NodeGeneration[] {
    const nodes: NodeGeneration[] = [];
    let nodeId = 0;

    for (let i = 0; i < rows && nodeId < numberOfNodes; i++) {
        for (let j = 0; j < cols && nodeId < numberOfNodes; j++) {
            nodes.push(createNode(nodeId, i, j, spacing, initialPosition, useNoise, noisePercentage));
            nodeId++;
        }
    }

    return nodes;
}

function generateSquarePositions(
    gridSize: number,
    numberOfNodes: number,
    spacing: number,
    initialPosition: Position,
    useNoise: boolean,
    noisePercentage: number
): NodeGeneration[] {
    return generateRectangularPositions(gridSize, gridSize, numberOfNodes, spacing, initialPosition, useNoise, noisePercentage);
}


function generateNodePositions(params: GridGenerationParams): { nodes: NodeGeneration[], cols: number } {
    const { gridType, spacing, useNoise, noisePercentage = 50, numberOfNodes, initialPosition } = params;

    switch (gridType) {
        case GridTypes.SQUARE: {
            const gridSize = params.gridSize || Math.ceil(Math.sqrt(numberOfNodes));
            const nodes = generateSquarePositions(
                gridSize,
                numberOfNodes,
                spacing,
                initialPosition,
                useNoise,
                noisePercentage
            );
            return { nodes, cols: gridSize };
        }

        case GridTypes.RECTANGULAR: {
            const rows = params.rows || Math.ceil(Math.sqrt(numberOfNodes));
            const columns = params.columns || Math.ceil(numberOfNodes / rows);
            const nodes = generateRectangularPositions(
                rows,
                columns,
                numberOfNodes,
                spacing,
                initialPosition,
                useNoise,
                noisePercentage
            );
            return { nodes, cols: columns };
        }

        default:
            throw new Error(`Unknown grid type: ${gridType}`);
    }
}

// GENERATE EDGES



function generateNeighborEdgesVH(nodes: NodeGeneration[], cols: number): EdgeGeneration[] {
    const edges: EdgeGeneration[] = [];
    const gridMap = createGridMap(nodes, cols);
    const rows = Math.ceil(nodes.length / cols);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const currentNode = gridMap.get(`${i},${j}`);
            if (!currentNode) continue;

            // Right neighbor
            const rightNode = gridMap.get(`${i},${j + 1}`);
            if (rightNode) {
                edges.push({
                    id: edges.length,
                    sourceId: currentNode.id,
                    targetId: rightNode.id,
                    weight: 1,
                });
            }

            // Bottom neighbor
            const bottomNode = gridMap.get(`${i + 1},${j}`);
            if (bottomNode) {
                edges.push({
                    id: edges.length,
                    sourceId: currentNode.id,
                    targetId: bottomNode.id,
                    weight: 1,
                });
            }
        }
    }

    return edges;
}

function generateNeighborEdgesVHD(nodes: NodeGeneration[], cols: number): EdgeGeneration[] {
    const edges: EdgeGeneration[] = [];
    const gridMap = createGridMap(nodes, cols);
    const rows = Math.ceil(nodes.length / cols);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const currentNode = gridMap.get(`${i},${j}`);
            if (!currentNode) continue;

            // Direita
            const rightNode = gridMap.get(`${i},${j + 1}`);
            if (rightNode) {
                edges.push({
                    id: edges.length,
                    sourceId: currentNode.id,
                    targetId: rightNode.id,
                    weight: 1,
                });
            }

            // Abaixo
            const bottomNode = gridMap.get(`${i + 1},${j}`);
            if (bottomNode) {
                edges.push({
                    id: edges.length,
                    sourceId: currentNode.id,
                    targetId: bottomNode.id,
                    weight: 1,
                });
            }

            // Diagonal inferior direita
            const diagRightNode = gridMap.get(`${i + 1},${j + 1}`);
            if (diagRightNode) {
                edges.push({
                    id: edges.length,
                    sourceId: currentNode.id,
                    targetId: diagRightNode.id,
                    weight: 1,
                });
            }

            // Diagonal inferior esquerda
            const diagLeftNode = gridMap.get(`${i + 1},${j - 1}`);
            if (diagLeftNode) {
                edges.push({
                    id: edges.length,
                    sourceId: currentNode.id,
                    targetId: diagLeftNode.id,
                    weight: 1,
                });
            }
        }
    }

    return edges;
}



function generateGridEdges(nodes: NodeGeneration[], fillingType: FillingType, cols: number, edgeProbability: number, maxAttempts: number): EdgeGeneration[] {
    switch (fillingType) {
        case FillingTypes.RANDOM:
            return generateRandomEdges(nodes, {edgeProbability, maxAttempts});
        case FillingTypes.FULLY_CONNECTED:
            return generateFullyConnectedEdges(nodes);
        case FillingTypes.NEIGHBORS_VH:
            return generateNeighborEdgesVH(nodes, cols);
        case FillingTypes.NEIGHBORS_VHD:
            return generateNeighborEdgesVHD(nodes, cols);
        default:
            return [];
    }
}


export function generateGrid(params: GridGenerationParams): Graph {
    const { fillingType, edgeProbability, maxAttempts } = params;

    const { nodes, cols } = generateNodePositions(params);
    const edges = generateGridEdges(nodes, fillingType, cols, edgeProbability, maxAttempts);

    return { nodes, edges };
}

export function generateGridSquare(
    gridSize: number,
    params: GridGenerationParams
): Graph {
    const { 
        spacing, 
        useNoise, 
        noisePercentage = 50, 
        fillingType, 
        numberOfNodes, 
        initialPosition, 
        edgeProbability, 
        maxAttempts 
    } = params;
    
    const nodes = generateSquarePositions(
        gridSize,
        numberOfNodes,
        spacing,
        initialPosition,
        useNoise,
        noisePercentage
    );

    const edges = generateGridEdges(nodes, fillingType, gridSize, edgeProbability, maxAttempts);

    return { nodes, edges };
}


export function generateGridRectangular(
    rows: number,
    cols: number,
    params: GridGenerationParams
): Graph {
    const { 
        spacing, 
        useNoise, 
        noisePercentage = 50, 
        fillingType, 
        numberOfNodes, 
        initialPosition, 
        edgeProbability, 
        maxAttempts 
    } = params;
    
    const nodes = generateRectangularPositions(
        rows,
        cols,
        numberOfNodes,
        spacing,
        initialPosition,
        useNoise,
        noisePercentage
    );

    const edges = generateGridEdges(nodes, fillingType, cols, edgeProbability, maxAttempts);

    return { nodes, edges };
}


export function generateRandom(count: number, width: number, height: number, edgeProbability: number, maxAttempts: number): Graph {
    const nodes: NodeGeneration[] = [];
    for (let i=0; i<count; i++){
        nodes.push({
            id: i,
            x: Math.random() * width,
            y: Math.random() * height,
            type: NodeTypes.NORMAL
        })
    }
    const edges: EdgeGeneration[] = generateRandomEdges(nodes, {edgeProbability, maxAttempts});

    return {nodes: nodes, edges: edges};
}