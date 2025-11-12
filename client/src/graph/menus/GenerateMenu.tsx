import { useState } from "react";
import { type NodeType, type Position } from "../../types";
import { generateGrid, generateRandom, GridTypes, type GridType } from "../generation/generationGrid";
import "./Menus.css";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { FillingTypes, type FillingType, type Graph } from "../generation/generationUtils";
import { generateRing } from "../generation/generationRing";
//import { generateRing } from "../generation/generationRing";


const GenerationTypes = {
    GRID: "GRID",
    RING: "RING",
    RANDOM: "RANDOM"
} as const;



type GenerationType = typeof GenerationTypes[keyof typeof GenerationTypes]


interface GenerateMenuProps {
    addNode: (x: number, y: number, type: NodeType, demand: number | null) => Promise<number>;
    addEdge: (node1Id: number, node2Id: number) => Promise<void>;
    viewBox: { x: number, y: number, width: number, height: number };
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function GenerateMenu({addNode, addEdge, viewBox, setErrorMessage}: GenerateMenuProps) {
    const [generationType, setGenerationType] = useState<GenerationType>(GenerationTypes.GRID);
    const [gridType, setGridType] = useState<GridType>(GridTypes.SQUARE);
    const [fillingType, setFillingType] = useState<FillingType>(FillingTypes.NEIGHBORS_VH);
    const [isFillingGrid, setIsFillingGrid] = useState(true);


    const [gridSize, setGridSize] = useState(3);
    const [rows, setRows] = useState(4);
    const [columns, setColumns] = useState(6);

    const [numberOfNodes, setNumberOfNodes] = useState(10);

    const [k, setK] = useState(2);
    const [probability, setProbability] = useState(0.1);

    const [m, setM] = useState(2);
    const [m0, setM0] = useState(3);

    const [styleParams, setStyleParams] = useState({
        spacing: 50,
        useNoise: false,
        noisePercentage: 50,
        useOnlyNodes: false
    });

    const [edgeProbability, setEdgeProbability] = useState<number>(0.5);
    const [maxAttempts, setMaxAttempts] = useState<number>(100);

    const getInitialPosition = (): Position => {
        const paddingLeft = 40;
        const paddingTop = 40;

        return {x: viewBox.x+paddingLeft, y: viewBox.y+paddingTop};
    }

    const getMaxNodes = () => {
        return gridType === GridTypes.SQUARE ? gridSize * gridSize : rows * columns;
    }

    const handleGenerate = async () => {
        try {
            const initialPosition = getInitialPosition();

            let nodeCount;
            if (generationType === GenerationTypes.GRID) {
                nodeCount = isFillingGrid ? getMaxNodes() : numberOfNodes;
            } else {
                nodeCount = numberOfNodes;
            }

            const baseParams = {
                spacing: styleParams.spacing,
                useNoise: styleParams.useNoise,
                noisePercentage: styleParams.noisePercentage,
                fillingType: fillingType,
                numberOfNodes: nodeCount,
                initialPosition: initialPosition
            };


            let graph: Graph;

            if (generationType === GenerationTypes.GRID) {
                graph = generateGrid({
                    ...baseParams,
                    gridType,
                    gridSize: gridType === GridTypes.SQUARE ? gridSize : undefined,
                    rows: gridType === GridTypes.RECTANGULAR ? rows : undefined,
                    columns: gridType === GridTypes.RECTANGULAR ? columns : undefined,
                    edgeProbability: edgeProbability,
                    maxAttempts: maxAttempts
                });
            } else if (generationType === GenerationTypes.RING) {
                graph = generateRing({
                    ...baseParams,
                    k: k,
                    probability: probability,
                    m: m,
                    m0: m0,
                    edgeProbability,
                    maxAttempts
                });
            } else {
                graph = generateRandom(nodeCount, viewBox.width, viewBox.height, edgeProbability, maxAttempts);
            }

            const { nodes, edges } = graph;
            
            
            // CREATE NODES IN BACKEND AND MAP NEW IDS
            const idMap = new Map<number, number>();
            for (const node of nodes){
                const oldId = node.id;
                const newId = await addNode(node.x, node.y, node.type, null);
                node.id = newId;
                idMap.set(oldId, newId);
            }
            if (!styleParams.useOnlyNodes){
                for (const edge of edges){
                    const newSourceId = idMap.get(edge.sourceId)!;
                    const newTargetId = idMap.get(edge.targetId)!;
                    
                    addEdge(newSourceId, newTargetId);
                }
            }
        } catch (error) {
            console.error("Generation error:", error);
            if (error instanceof Error){
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Failed to generate graph");
            }
        }
        
    }
    
    return (
        <div className="menu-content">
            <div className="params-group generation-type">
                <label htmlFor="generationType">Generation Type:</label>
                <select 
                    id="generationType"
                    value={generationType} 
                    onChange={(e) => {setGenerationType(e.target.value.toUpperCase() as GenerationType)}}
                >
                    <option value="GRID">Grid</option>
                    <option value="RING">Ring</option>
                    <option value="RANDOM">Random</option>
                </select>
            </div>
            
            {generationType === GenerationTypes.GRID && (
            <div className="params">
                <CollapsibleSection title="GRID TYPES">
                    <div className="params-group grid-types"> 
                        <label htmlFor="gridType">Grid Type:</label>
                        <select 
                            id="gridType"
                            value={gridType} 
                            onChange={(e) => setGridType(e.target.value as GridType)}
                        >
                            <option value={GridTypes.SQUARE}>Square</option>
                            <option value={GridTypes.RECTANGULAR}>Rectangular</option>
                        </select>
                        {gridType === GridTypes.SQUARE ? (
                            <>
                                <label htmlFor="gridSize">Grid Size:</label>
                                <input
                                    id="gridSize"
                                    type="number"
                                    min="1"
                                    value={gridSize}
                                    onChange={(e) => setGridSize(+e.target.value)}
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor="rows">Rows:</label>
                                <input
                                    id="rows"
                                    type="number"
                                    min="1"
                                    value={rows}
                                    onChange={(e) => setRows(+e.target.value)}
                                />
                                <label htmlFor="columns">Columns:</label>
                                <input
                                    id="columns"
                                    type="number"
                                    min="1"
                                    value={columns}
                                    onChange={(e) => setColumns(+e.target.value)}
                                />
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="FILLING">
                
                    <div>
                        <div className="params-group">
                            <label htmlFor="isFillingGrid">Fill Grid:</label>
                            <input
                                id="isFillingGrid"
                                type="checkbox"
                                checked={isFillingGrid}
                                onChange={(e) => setIsFillingGrid(e.target.checked)}
                            />
                        </div> 
                        {!isFillingGrid && (
                        <div className="params-group">
                            <label htmlFor="numberOfNodes">Number of Nodes:</label>
                            <input
                                id="numberOfNodes"
                                type="number"
                                min="1"
                                max={getMaxNodes()}
                                value={numberOfNodes}
                                onChange={(e) => setNumberOfNodes(Math.min(+e.target.value, getMaxNodes()))}
                            />
                            <span className="hint">Max: {getMaxNodes()}</span>
                        </div>
                        )}

                        
                        <div>
                            <label htmlFor="fillingType">Connection Pattern:</label>
                            <select
                                id="fillingType"
                                value={fillingType}
                                onChange={(e) => setFillingType(e.target.value as FillingType)}
                            >
                                <option value={FillingTypes.RANDOM}>Random</option>
                                <option value={FillingTypes.FULLY_CONNECTED}>Fully Connected</option>
                                <option value={FillingTypes.NEIGHBORS_VH}>Neighbors (V+H)</option>
                                <option value={FillingTypes.NEIGHBORS_VHD}>Neighbors+ (V+H+Diag)</option>
                            </select>
                        </div>

                        {fillingType === FillingTypes.RANDOM && (
                            <>
                                <label htmlFor="edgeProb">Edge Probability:</label>
                                <input
                                    id="edgeProb"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={edgeProbability}
                                    onChange={(e) => setEdgeProbability(+e.target.value)}
                                />
                                <span className="full-width-text">
                                    {(edgeProbability * 100).toFixed(0)}% chance for each possible edge
                                </span>

                                <label htmlFor="maxAttempts">Max Attempts:</label>
                                <input
                                    id="maxAttempts"
                                    type="number"
                                    min="10"
                                    max="1000"
                                    value={maxAttempts}
                                    onChange={(e) => setMaxAttempts(+e.target.value)}
                                />
                                <span className="hint">Tries to generate connected graph</span>
                            </>
                            )}
                        
                    </div>
                </CollapsibleSection>
                
                <CollapsibleSection title="OPTIONS">
                    <div className="params-group common"> 
                        <label htmlFor="spacing">Spacing: </label>
                        <input
                            id="spacing"
                            type="number" 
                            value={styleParams.spacing} 
                            onChange={(e) => setStyleParams({ ...styleParams, spacing: +e.target.value })}
                        />


                        <label htmlFor="useNoise">Use Noise?: </label>
                        <input 
                            id="useNoise"
                            type="checkbox" 
                            checked={styleParams.useNoise}
                            onChange={(e) => setStyleParams({ ...styleParams, useNoise: e.target.checked })}
                        />

                        <label htmlFor="useOnlyNodes">Generate only nodes?: </label>
                        <input 
                            id="useOnlyNodes"
                            type="checkbox" 
                            checked={styleParams.useOnlyNodes}
                            onChange={(e) => setStyleParams({ ...styleParams, useOnlyNodes: e.target.checked })}
                        />
                    </div>
                </CollapsibleSection>
            </div>
            )}

            {generationType === GenerationTypes.RING && (
                <div className="params">
                    <div className="params-group">
                        <label htmlFor="nodeNumber">Number of Nodes: </label>
                        <input
                            id="nodeNumber"
                            type="number" 
                            value={numberOfNodes} 
                            onChange={(e) => setNumberOfNodes(+e.target.value)}
                        />
                    </div>
                    <div className="params-group">
                        <label htmlFor="spacing">Spacing: </label>
                        <input
                            id="spacing"
                            type="number" 
                            value={styleParams.spacing} 
                            onChange={(e) => setStyleParams({ ...styleParams, spacing: +e.target.value })}
                        />
                    </div>
                    <CollapsibleSection title="FILLING">
                        <div className="params-group filling"> 
                            <label htmlFor="fillingType">Connection Pattern:</label>
                            <select
                                id="fillingType"
                                value={fillingType}
                                onChange={(e) => setFillingType(e.target.value as FillingType)}
                            >
                                <option value={FillingTypes.RING_NEIGHBORS}>Circular Neighbors</option>
                                <option value={FillingTypes.RING_LATTICE}>Ring Lattice</option>
                                <option value={FillingTypes.SMALL_WORLD}>Small World</option>
                                <option value={FillingTypes.SCALE_FREE}>Scale Free</option>
                                <option value={FillingTypes.ERDOS_RENYI}>Erdos-Renyi</option>
                                <option value={FillingTypes.FULLY_CONNECTED}>Fully Connected</option>
                                <option value={FillingTypes.RANDOM}>Random</option>
                            </select>
                            {(fillingType === FillingTypes.RING_LATTICE || 
                            fillingType === FillingTypes.SMALL_WORLD) && (
                                <>
                                    <label htmlFor="k">K (neighbors per side × 2):</label>
                                    <input
                                        id="k"
                                        type="number"
                                        min="2"
                                        max={numberOfNodes-2}
                                        step="2"
                                        value={k}
                                        onChange={(e) => setK(Math.floor(+e.target.value / 2) * 2)}
                                    />
                                    
                                    <span className="full-width-text">
                                        Must be even, max: {Math.floor((numberOfNodes-2)/2)*2}
                                    </span>
                                </>
                            )}
                            {(fillingType === FillingTypes.SMALL_WORLD || 
                            fillingType === FillingTypes.ERDOS_RENYI) && (
                            <>
                                <label htmlFor="probability">
                                    {fillingType === FillingTypes.SMALL_WORLD 
                                        ? <span>Rewire Probability</span>
                                        : <span>Connect Probability</span>}
                                </label>
                                <input
                                    id="probability"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={probability}
                                    onChange={(e) => setProbability(+e.target.value)}
                                />
                                <span className="full-width-text">
                                    {(probability * 100).toFixed(0)}%
                                </span>
                            </>
                            )}
                            {fillingType === FillingTypes.SCALE_FREE && (
                            <>
                                <label htmlFor="scaleFreeNeighboors">M (edges per new node):</label>
                                <input
                                    id="scaleFreeNeighboors"
                                    type="number"
                                    min="1"
                                    max={numberOfNodes-1}
                                    step="1"
                                    value={m}
                                    onChange={(e) => setM(+e.target.value)}
                                />
                                <label htmlFor="scaleFreeInitialNodes">M0 (initial nodes):</label>
                                <input
                                    id="scaleFreeInitialNodes"
                                    type="number"
                                    min="2"
                                    max={numberOfNodes-1}
                                    step="1"
                                    value={m0}
                                    onChange={(e) => setM0(+e.target.value)}
                                />
                                <span className="full-width-text">
                                    Initial complete graph size m0 {">"}= m
                                </span>
                            </>
                            )}
                            {fillingType === FillingTypes.RANDOM && (
                            <>
                                <label htmlFor="edgeProb">Edge Probability:</label>
                                <input
                                    id="edgeProb"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={edgeProbability}
                                    onChange={(e) => setEdgeProbability(+e.target.value)}
                                />
                                <span className="full-width-text">
                                    {(edgeProbability * 100).toFixed(0)}% chance for each possible edge
                                </span>

                                <label htmlFor="maxAttempts">Max Attempts:</label>
                                <input
                                    id="maxAttempts"
                                    type="number"
                                    min="10"
                                    max="1000"
                                    value={maxAttempts}
                                    onChange={(e) => setMaxAttempts(+e.target.value)}
                                />
                                <span className="hint">Tries to generate connected graph</span>
                            </>
                            )}

                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {generationType === GenerationTypes.RANDOM && (
            <div className="params-group">
                <label htmlFor="nodeNumber">Number of Nodes: </label>
                <input
                    id="nodeNumber"
                    type="number" 
                    value={numberOfNodes} 
                    onChange={(e) => setNumberOfNodes(+e.target.value)}
                />
                <label htmlFor="edgeProb">Edge Probability:</label>
                <input
                    id="edgeProb"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={edgeProbability}
                    onChange={(e) => setEdgeProbability(+e.target.value)}
                />
                <span className="full-width-text">
                    {(edgeProbability * 100).toFixed(0)}% chance for each possible edge
                </span>

                <label htmlFor="maxAttempts">Max Attempts:</label>
                <input
                    id="maxAttempts"
                    type="number"
                    min="10"
                    max="1000"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(+e.target.value)}
                />
                <span className="hint">Tries to generate connected graph</span>
            </div>
            
            )}
            
            <div className="menu-button">
                <button onClick={handleGenerate}>Generate</button>
            </div>
            
            
        </div>
    )
}