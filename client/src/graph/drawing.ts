import type { Position } from "../types/types";
import type { GraphEdge, GraphNode } from "./SVGCanvas";

interface NodeDrawing {
    id: number;
    pos: Position;
    disp: Position;
}

interface NodePositions {
    timestamp: number;
    positions: Position[]
}

interface EdgesDrawing {
    source: NodeDrawing;
    target: NodeDrawing;
}

function forceAttraction(distance: number, k: number): number {
    return (distance**2)/k;
}

function forceRepulsion(distance: number, k: number): number {
    return -(1*k**2)/distance;
}

function vectorDifference(v: Position, u:Position): Position {
    return {
        x: v.x - u.x,
        y: v.y - u.y
    }
}

function updateDispersion(
    node: NodeDrawing, 
    delta: Position, 
    forceFunction: (distance: number, k: number) => number,
    k: number
): Position {
    
    const distance: number = Math.sqrt(delta.x**2 + delta.y**2);
    const force: number = forceFunction(distance, k)
    if (distance < 0.01) {
        return node.disp; 
    }
    return {
        x: (delta.x/distance) * force,
        y: (delta.y/distance) * force
    }
}

function cooling(iteration: number): number {
    return Math.pow(0.95, iteration);
}


/*
    Implemention based on the following paper:
    Graph Drawing by Force–Directed Placement
    THOMAS M. J. FRUCHTERMAN AND EDWARD M. REINGOLD
*/
export function forceDirected(W: number, L: number, nodes: GraphNode[], edges: GraphEdge[], maxIterarions: number): NodePositions[] {
    // initialization
    const area = W * L;
    const k = Math.sqrt(area/nodes.length);
    const nodesDraw: NodeDrawing[] = nodes.map(node => ({
        id: node.id,
        pos: {x: node.cx, y: node.cy},
        disp: {x:0, y: 0}
    }));
    const edgesDraw: EdgesDrawing[] = edges.map(edge => {
        const source = nodesDraw.find(node => edge.sourceId === node.id);
        const target = nodesDraw.find(node => edge.targetId === node.id);
    
        if (!source || !target) {
            throw new Error(`Edge ${edge.id} has invalid source or target`);
        }
        return { source: source, target: target };
    });
    const nodePositionsSeries: NodePositions[] = [];
    nodePositionsSeries.push({
        timestamp: 0,
        positions: nodesDraw.map(node => node.pos)
    })
        
    let i = 0;
    while (i<maxIterarions){
        for (const node of nodesDraw) {
            node.disp = { x: 0, y: 0 };
        }
        // calculate repulsive forces
        for (const node1 of nodesDraw){
            for (const node2 of nodesDraw){
                if (node1 != node2){
                    const delta: Position = vectorDifference(node1.pos, node2.pos);
                    // delta magnitude
                    const dispUpdate = updateDispersion(node1, delta, forceRepulsion, k);
                    node1.disp.x += dispUpdate.x;
                    node1.disp.y += dispUpdate.y;
                    
                    //node1.disp = updateDispersion(node1, delta, forceRepulsion, k);
                }
            }
        }
        // calculate attractive forces
        for (const edge of edgesDraw){
            const delta: Position = vectorDifference(edge.source.pos, edge.target.pos);
            const negativeDelta: Position = {x: -delta.x, y:-delta.y};
            const sourceForce = updateDispersion(edge.source, negativeDelta, forceAttraction, k);
            edge.source.disp.x += sourceForce.x; 
            edge.source.disp.y += sourceForce.y;
            
            const targetForce = updateDispersion(edge.target, delta, forceAttraction, k);
            edge.target.disp.x += targetForce.x;  
            edge.target.disp.y += targetForce.y;
        }
        // update positions
        for (const node of nodesDraw){
            node.pos = {
                x: node.pos.x + node.disp.x * cooling(i),
                y: node.pos.y + node.disp.y * cooling(i),
            }
            //node.pos.x = Math.max(0, Math.min(W - 0, node.pos.x));
            //node.pos.y = Math.max(0, Math.min(L - 0, node.pos.y));
            console.log("INSIDEDRAWING:"+ node.disp.x);
        }
        i+=1;
        nodePositionsSeries.push({
            timestamp: i,
            positions: nodesDraw.map(node => node.pos)
        })
    }
    return nodePositionsSeries;
}


// 1
// x

// 2
// x x

// 3
// x x
// x

// 4 
// x x
// x x

// 5
// x x x
// x x

// 6
// x x x
// x x x

// 7 
// x x x
// x x x
// x

// 1: 1x1
// 2-4: 2x2
// 5-9: 3x3
// 10-16: 4x4