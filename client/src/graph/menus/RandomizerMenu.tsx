import { useState } from "react";
import "./Menus.css";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import type { GraphEdge, GraphNode } from "../SVGCanvas";
import type { NodeActions } from "../useGraphNodes";
import type { EdgeActions } from "../useGraphEdges";
import { generateRandomEdges, randomizeNodeTypes, randomizeWeights, type RandomEdgesParams, type RandomNodeTypeParams, type RandomWeightParams } from "../generation/random";



interface RandomizerMenuProps {
    nodeList: GraphNode[];
    edgeList: GraphEdge[];
    nodeActions: NodeActions;
    edgeActions: EdgeActions;
}

export function RandomizerMenu({ nodeList, edgeList, nodeActions, edgeActions }: RandomizerMenuProps) {
    // =====================================================
    // RANDOM WEIGHT STATE
    // =====================================================
    const [weightParams, setWeightParams] = useState<RandomWeightParams>({
        from: 1,
        to: 10,
        includeDecimalValues: false,
        fullRandom: true,
        numberOfEdges: 1,
        randomNumberOfEdges: false
    });

    // =====================================================
    // RANDOM NODE TYPE STATE
    // =====================================================
    const [nodeTypeParams, setNodeTypeParams] = useState<RandomNodeTypeParams>({
        consumerProbability: 0.5
    });

    // =====================================================
    // RANDOM EDGES STATE
    // =====================================================
    const [edgesParams, setEdgesParams] = useState<RandomEdgesParams>({
        edgeProbability: 0.3,
        maxAttempts: 100
    });

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleRandomizeWeights = async () => {
        if (edgeList.length === 0) {
            alert("No edges to randomize!");
            return;
        }

        // Validações
        if (weightParams.from < 0 || weightParams.to < 0) {
            alert("Weight values must be positive!");
            return;
        }

        if (weightParams.from >= weightParams.to) {
            alert("'From' value must be less than 'To' value!");
            return;
        }

        if (!weightParams.fullRandom && !weightParams.randomNumberOfEdges && 
            (!weightParams.numberOfEdges || weightParams.numberOfEdges < 1)) {
            alert("Please specify a valid number of edges!");
            return;
        }

        try {
            const uniqueEdges = edgeActions.getUnique();
            const updatedWeights = randomizeWeights(uniqueEdges, weightParams);
            
            // Atualiza os pesos
            for (const [edgeId, newWeight] of updatedWeights) {
                await edgeActions.updateWeight(edgeId, newWeight);
            }
            
            console.log(`Randomized ${updatedWeights.size} edge weights`);
        } catch (error) {
            console.error("Error randomizing weights:", error);
            alert("Failed to randomize weights");
        }
    };

    const handleRandomizeNodeTypes = async () => {
        if (nodeList.length === 0) {
            alert("No nodes to randomize!");
            return;
        }

        if (nodeTypeParams.consumerProbability < 0 || nodeTypeParams.consumerProbability > 1) {
            alert("Probability must be between 0 and 1!");
            return;
        }

        try {
            const updatedTypes = randomizeNodeTypes(nodeList, nodeTypeParams);
            
            // Atualiza os tipos
            for (const [nodeId, newType] of updatedTypes) {
                await nodeActions.updateType(nodeId, newType);
            }
            
            const consumerCount = Array.from(updatedTypes.values())
                .filter(type => type === "CONSUMER").length;
            console.log(`Randomized node types: ${consumerCount} consumers, ${nodeList.length - consumerCount} normal`);
        } catch (error) {
            console.error("Error randomizing node types:", error);
            alert("Failed to randomize node types");
        }
    };

    const handleRandomizeEdges = async () => {
        if (nodeList.length < 2) {
            alert("Need at least 2 nodes to generate edges!");
            return;
        }

        if (edgesParams.edgeProbability < 0 || edgesParams.edgeProbability > 1) {
            alert("Probability must be between 0 and 1!");
            return;
        }

        try {
            // Deleta todas as arestas existentes
            const uniqueEdges = edgeActions.getUnique();
            for (const edge of uniqueEdges) {
                await edgeActions.delete(edge.sourceId, edge.targetId);
            }

            // Gera novas arestas (tenta até conseguir um grafo conexo)
            const newEdges = generateRandomEdges(nodeList, edgesParams);
            console.log("EDGELIST INSIDE HERE");
            console.log(edgeList);
            // Adiciona as novas arestas
            for (const edge of newEdges) {
                await edgeActions.add(edge.sourceId, edge.targetId, 1);
            }
            
            console.log(`Generated ${newEdges.length} random edges (connected graph)`);
        } catch (error) {
            console.error("Error generating random edges:", error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Failed to generate random edges");
            }
        }
    };

    return (
        <div className="menu-content">
            {/* =====================================================
                RANDOM WEIGHT SECTION
            ===================================================== */}
            <div className="params">
                <CollapsibleSection title="RANDOM WEIGHT">
                    <div className="params-group">
                        <label htmlFor="weightFrom">From:</label>
                        <input
                            id="weightFrom"
                            type="number"
                            min="0"
                            step={weightParams.includeDecimalValues ? "0.1" : "1"}
                            value={weightParams.from}
                            onChange={(e) => setWeightParams({ 
                                ...weightParams, 
                                from: Math.max(0, +e.target.value) 
                            })}
                        />

                        <label htmlFor="weightTo">To:</label>
                        <input
                            id="weightTo"
                            type="number"
                            min="0"
                            step={weightParams.includeDecimalValues ? "0.1" : "1"}
                            value={weightParams.to}
                            onChange={(e) => setWeightParams({ 
                                ...weightParams, 
                                to: Math.max(0, +e.target.value) 
                            })}
                        />

                        <label htmlFor="includeDecimal">Include Decimal Values:</label>
                        <input
                            id="includeDecimal"
                            type="checkbox"
                            checked={weightParams.includeDecimalValues}
                            onChange={(e) => setWeightParams({ 
                                ...weightParams, 
                                includeDecimalValues: e.target.checked 
                            })}
                        />

                        <label htmlFor="fullRandom">Randomize All Edges:</label>
                        <input
                            id="fullRandom"
                            type="checkbox"
                            checked={weightParams.fullRandom}
                            onChange={(e) => setWeightParams({ 
                                ...weightParams, 
                                fullRandom: e.target.checked 
                            })}
                        />

                        {!weightParams.fullRandom && (
                            <>
                                <label htmlFor="randomNumberOfEdges">Random Number of Edges:</label>
                                <input
                                    id="randomNumberOfEdges"
                                    type="checkbox"
                                    checked={weightParams.randomNumberOfEdges}
                                    onChange={(e) => setWeightParams({ 
                                        ...weightParams, 
                                        randomNumberOfEdges: e.target.checked 
                                    })}
                                />

                                {!weightParams.randomNumberOfEdges && (
                                    <>
                                        <label htmlFor="numberOfEdges">Number of Edges:</label>
                                        <input
                                            id="numberOfEdges"
                                            type="number"
                                            min="1"
                                            max={edgeList.length}
                                            value={weightParams.numberOfEdges}
                                            onChange={(e) => setWeightParams({ 
                                                ...weightParams, 
                                                numberOfEdges: Math.min(+e.target.value, edgeList.length) 
                                            })}
                                        />
                                        <span className="hint">Max: {edgeList.length}</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="menu-button">
                        <button onClick={handleRandomizeWeights}>Randomize Weights</button>
                    </div>
                </CollapsibleSection>

                {/* =====================================================
                    RANDOM NODE TYPE SECTION
                ===================================================== */}
                <CollapsibleSection title="RANDOM NODE TYPE">
                    <div className="params-group">
                        <label htmlFor="consumerProb">Consumer Probability:</label>
                        <input
                            id="consumerProb"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={nodeTypeParams.consumerProbability}
                            onChange={(e) => setNodeTypeParams({ 
                                consumerProbability: Math.max(0, Math.min(1, +e.target.value)) 
                            })}
                        />
                        <span className="full-width-text">
                            {(nodeTypeParams.consumerProbability * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="menu-button">
                        <button onClick={handleRandomizeNodeTypes}>Randomize Node Types</button>
                    </div>
                </CollapsibleSection>

                {/* =====================================================
                    RANDOM EDGES SECTION
                ===================================================== */}
                <CollapsibleSection title="RANDOM EDGES (CONNECTED GRAPH)">
                    <div className="params-group">
                        <label htmlFor="edgeProb">Edge Probability:</label>
                        <input
                            id="edgeProb"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={edgesParams.edgeProbability}
                            onChange={(e) => setEdgesParams({ 
                                ...edgesParams, 
                                edgeProbability: Math.max(0, Math.min(1, +e.target.value))
                            })}
                        />
                        <span className="full-width-text">
                            {(edgesParams.edgeProbability * 100).toFixed(0)}% chance for each possible edge
                        </span>

                        <label htmlFor="maxAttempts">Max Attempts:</label>
                        <input
                            id="maxAttempts"
                            type="number"
                            min="10"
                            max="1000"
                            value={edgesParams.maxAttempts}
                            onChange={(e) => setEdgesParams({ 
                                ...edgesParams, 
                                maxAttempts: Math.max(10, +e.target.value)
                            })}
                        />
                        <span className="hint">Tries to generate connected graph</span>
                    </div>
                    <div className="menu-button">
                        <button onClick={handleRandomizeEdges}>Generate Random Edges</button>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}