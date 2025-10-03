import { useState } from "react";
import type { Position } from "../../types/types";
import { generateGridRandom, generateRandom } from "../generate";
import "./Menus.css";


const GenerationTypes = {
    GRID: "GRID",
    GRID_RANDOM: "GRID_RANDOM",
    RANDOM: "RANDOM"
} as const;

type GenerationType = typeof GenerationTypes[keyof typeof GenerationTypes]

interface GenerateMenuPros {
    addNode: (x: number, y: number) => Promise<number>;
    addEdge: (node1Id: number, node2Id: number) => Promise<void>;
    svgRef: React.RefObject<SVGSVGElement | null>;
    viewBox: { x: number, y: number, width: number, height: number };
}

export function GenerateMenuContent({addNode, addEdge, svgRef, viewBox}: GenerateMenuPros) {
    const [generationType, setGenerationType] = useState<GenerationType>(GenerationTypes.GRID_RANDOM);
    const [gridParams, setGridParams] = useState({
        numberOfNodes: 10,
        spacing: 30,
        useNoise: false,
        useOnlyNodes: false
    });

    const getInitialPosition = (): Position => {
        const paddingLeft = 40;
        const paddingTop = 40;

        return {x: viewBox.x+paddingLeft, y: viewBox.y+paddingTop};
    }
    const handleGenerate = async () => {
        const initialPosition = getInitialPosition();
        const { nodes, edges } = generationType === GenerationTypes.GRID_RANDOM
            ? generateGridRandom(gridParams.numberOfNodes, gridParams.spacing, initialPosition)
            : generateRandom(gridParams.numberOfNodes, viewBox.width, viewBox.height)
        const idMap = new Map<number, number>();
        for (const node of nodes){
            const oldId = node.id;
            const newId = await addNode(node.cx, node.cy);
            node.id = newId;
            idMap.set(oldId, newId);
        }
        if (!gridParams.useOnlyNodes){
            for (const edge of edges){
                const newSourceId = idMap.get(edge.sourceId)!;
                const newTargetId = idMap.get(edge.targetId)!;
                addEdge(newSourceId, newTargetId);
            }
        }
    }
    
    return (
        <>
            <select value={generationType} onChange={(e) => {
                console.log("BLHABLHA"+e.target.value)
                setGenerationType(e.target.value.toUpperCase() as GenerationType)
            }}>
                <option value="GRID_RANDOM">Grid</option>
                <option value="RANDOM">Random</option>
            </select>
      
            {generationType === GenerationTypes.GRID_RANDOM && (
                <div className="params">
                    <label htmlFor="nodeNumber">Number of Nodes: </label>
                    <input
                        id="nodeNumber"
                        type="number" 
                        value={gridParams.numberOfNodes} 
                        onChange={(e) => setGridParams({ ...gridParams, numberOfNodes: +e.target.value })}
                    />

                    <label htmlFor="spacing">Spacing: </label>
                    <input
                        id="spacing"
                        type="number" 
                        value={gridParams.spacing} 
                        onChange={(e) => setGridParams({ ...gridParams, spacing: +e.target.value })}
                    />


                    <label htmlFor="useNoise">Use Noise?: </label>
                    <input 
                        id="useNoise"
                        type="checkbox" 
                        checked={gridParams.useNoise}
                        onChange={(e) => setGridParams({ ...gridParams, useNoise: e.target.checked })}
                    />

                    <label htmlFor="useOnlyNodes">Generate only nodes?: </label>
                    <input 
                        id="useOnlyNodes"
                        type="checkbox" 
                        checked={gridParams.useOnlyNodes}
                        onChange={(e) => setGridParams({ ...gridParams, useOnlyNodes: e.target.checked })}
                    />

                </div>
            )}

            {generationType === GenerationTypes.RANDOM && (
                <div className="params">
                    <label htmlFor="nodeNumber">Number of Nodes: </label>
                    <input
                        id="nodeNumber"
                        type="number" 
                        value={gridParams.numberOfNodes} 
                        onChange={(e) => setGridParams({ ...gridParams, numberOfNodes: +e.target.value })}
                    />
                {/* ... outros inputs */}
                </div>
            )}
      
            <button onClick={handleGenerate}>Generate</button>
        </>
    )
}