import { useState } from "react";
import "./Menus.css";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import type { GraphNode, NodeActions } from "../useGraphNodes";
import type { EdgeActions, GraphEdge } from "../useGraphEdges";
import { generateRandomEdges, randomizeNodes, randomizeWeights, type RandomEdgesParams, type RandomNodeParams, type RandomWeightParams } from "../generation/random";



interface RandomizerMenuProps {
    nodeList: GraphNode[];
    edgeList: GraphEdge[];
    nodeActions: NodeActions;
    edgeActions: EdgeActions;
}

export function RandomizerMenu({ nodeList, edgeList, nodeActions, edgeActions }: RandomizerMenuProps) {
    const [weightParams, setWeightParams] = useState<RandomWeightParams>({
        from: 1,
        to: 10,
        includeDecimalValues: false,
        fullRandom: true,
        numberOfEdges: 1,
        randomNumberOfEdges: false
    });

    const [nodeParams, setNodeParams] = useState<RandomNodeParams>({
        randomizeConsumers: true, 
        consumerProbability: 0.5,
        randomizeDemands: false,
        demandFrom: 1,
        demandTo: 10,
        includeDecimalDemands: false
    });

    const [edgesParams, setEdgesParams] = useState<RandomEdgesParams>({
        edgeProbability: 0.3,
        maxAttempts: 100
    });


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
            
            for (const [edgeId, newWeight] of updatedWeights) {
                const [forwardId, backwardId] = edgeActions.getPair(edgeId);
                if (!!forwardId && !!backwardId){
                    await edgeActions.updateWeight(forwardId, newWeight);
                    await edgeActions.updateWeight(backwardId, newWeight);
                } else {
                    console.error("Error while finding edge pair");
                }
                
            }

        } catch (error) {
            console.error("Error randomizing weights:", error);
            alert("Failed to randomize weights");
        }
    };

    const handleRandomizeNodes = async () => {
        if (nodeList.length === 0) {
            alert("No nodes to randomize!");
            return;
        }

        // Validação: pelo menos uma opção deve estar ativa
        if (!nodeParams.randomizeConsumers && !nodeParams.randomizeDemands) {
            alert("Please select at least one option: Randomize Consumers or Randomize Demands!");
            return;
        }

        if (nodeParams.randomizeConsumers && 
            (nodeParams.consumerProbability < 0 || nodeParams.consumerProbability > 1)) {
            alert("Probability must be between 0 and 1!");
            return;
        }

        if (nodeParams.randomizeDemands) {
            if (nodeParams.demandFrom < 0 || nodeParams.demandTo < 0) {
                alert("Demand values must be positive!");
                return;
            }

            if (nodeParams.demandFrom >= nodeParams.demandTo) {
                alert("'From' value must be less than 'To' value!");
                return;
            }
        }

        try {
            const { types, demands } = randomizeNodes(nodeList, nodeParams);
            
            if (types) {
                for (const [nodeId, newType] of types) {
                    await nodeActions.updateType(nodeId, newType);
                }
            }
            
            if (demands) {
                for (const [nodeId, newDemand] of demands) {
                    await nodeActions.updateDemand(nodeId, newDemand);
                }
            }

        } catch (error) {
            console.error("Error randomizing nodes:", error);
            alert("Failed to randomize nodes");
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
            // Deleta all edges
            const uniqueEdges = edgeActions.getUnique();
            for (const edge of uniqueEdges) {
                await edgeActions.delete(edge.sourceId, edge.targetId);
            }

    
            const newEdges = generateRandomEdges(nodeList, edgesParams);
            for (const edge of newEdges) {
                await edgeActions.add(edge.sourceId, edge.targetId, 1);
            }
            
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
                                        <span className="hint">Max: {edgeList.length/2}</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="menu-button">
                        <button onClick={handleRandomizeWeights}>Randomize Weights</button>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="RANDOM NODES">
                    <div className="params-group">
                        <label htmlFor="randomizeConsumers">Randomize Consumers:</label>
                        <input
                            id="randomizeConsumers"
                            type="checkbox"
                            checked={nodeParams.randomizeConsumers}
                            onChange={(e) => setNodeParams({ 
                                ...nodeParams, 
                                randomizeConsumers: e.target.checked 
                            })}
                        />

                        {nodeParams.randomizeConsumers && (
                            <>
                                <label htmlFor="consumerProb">Consumer Probability:</label>
                                <input
                                    id="consumerProb"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={nodeParams.consumerProbability}
                                    onChange={(e) => setNodeParams({ 
                                        ...nodeParams,
                                        consumerProbability: Math.max(0, Math.min(1, +e.target.value)) 
                                    })}
                                />
                                <span className="full-width-text">
                                    {(nodeParams.consumerProbability * 100).toFixed(0)}%
                                </span>
                            </>
                        )}

                        <label htmlFor="randomizeDemands">Randomize Demands:</label>
                        <input
                            id="randomizeDemands"
                            type="checkbox"
                            checked={nodeParams.randomizeDemands}
                            onChange={(e) => setNodeParams({ 
                                ...nodeParams, 
                                randomizeDemands: e.target.checked 
                            })}
                        />

                        {nodeParams.randomizeDemands && (
                            <>
                                <label htmlFor="demandFrom">Demand From:</label>
                                <input
                                    id="demandFrom"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step={nodeParams.includeDecimalDemands ? "0.1" : "1"}
                                    value={nodeParams.demandFrom}
                                    onChange={(e) => {
                                        const value = +e.target.value;
                                        setNodeParams({ 
                                            ...nodeParams, 
                                            demandFrom: Math.min(100, Math.max(0, value))
                                        });
                                    }}
                                />

                                <label htmlFor="demandTo">Demand To:</label>
                                <input
                                    id="demandTo"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step={nodeParams.includeDecimalDemands ? "0.1" : "1"}
                                    value={nodeParams.demandTo}
                                    onChange={(e) => {
                                        const value = +e.target.value;
                                        setNodeParams({ 
                                            ...nodeParams, 
                                            demandTo: Math.min(100, Math.max(0, value))
                                        });
                                    }}
                                />

                                <label htmlFor="includeDecimalDemands">Include Decimal Demands:</label>
                                <input
                                    id="includeDecimalDemands"
                                    type="checkbox"
                                    checked={nodeParams.includeDecimalDemands}
                                    onChange={(e) => setNodeParams({ 
                                        ...nodeParams, 
                                        includeDecimalDemands: e.target.checked 
                                    })}
                                />
                                <span className="full-width-text hint">
                                    Only for CONSUMER nodes
                                </span>
                            </>
                        )}
                    </div>
                    <div className="menu-button">
                        <button onClick={handleRandomizeNodes}>Randomize Nodes</button>
                    </div>
                </CollapsibleSection>

            
                <CollapsibleSection title="RANDOM EDGES">
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