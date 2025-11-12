import { useState } from "react";
import { graphAPI, type PMedianRequest } from "../graphAPI";
import type { NodeActions } from "../useGraphNodes";
import { NodeTypes } from "../../types";
import { resetClusterColors } from "../../colors";

const PMedianAlgorithms = {
    GREEDY: "GREEDY",
    INTERCHANGE: "INTERCHANGE",
    CLUSTERING: "CLUSTERING"
} as const;

type PMedianAlgorithm = typeof PMedianAlgorithms[keyof typeof PMedianAlgorithms]

interface PMedianMenuProps {
    nodeActions: NodeActions;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function PMedianMenu({ nodeActions, setErrorMessage }: PMedianMenuProps) {
    const [pMedianAlgorithm, setPMedianAlgorithm] = useState<PMedianAlgorithm>(PMedianAlgorithms.GREEDY);
    const [p, setP] = useState<number>(1);
    const [useDemand, setUseDemand] = useState<boolean>(false);
    const [lastCost, setLastCost] = useState<number | null>(null);

    
    
    const handleResetPMedian = () => {
        resetClusterColors();
        nodeActions.resetClusters();
        nodeActions.getNodes().forEach(node => {
            if (node.type === NodeTypes.FACILITY) {
                nodeActions.updateType(node.id, NodeTypes.NORMAL);
            }
        });
        setLastCost(null);
    };

    const handlePMedian = async () => {
        if (nodeActions.isEmpty()){
            setErrorMessage("Graph is empty!");
            return;
        }


        const nodes = nodeActions.getNodes();
        const consumers = nodes.filter(n => n.type === NodeTypes.CONSUMER)
        const nonConsumers = nodes.filter(n => n.type !== NodeTypes.CONSUMER);

        if (consumers.length == 0){
            setErrorMessage("Graph has no consumer nodes");
            return;
        }

        const maxFacilities = Math.min(nonConsumers.length, consumers.length);
    
        if (p > maxFacilities) {
             setErrorMessage(`Maximum number of facilities is ${maxFacilities}`);
            return;
        }

        try {
            const request: PMedianRequest = {
                algorithm: pMedianAlgorithm,
                p: p,
                useDemand: useDemand,
                useRandomInitialization: true
            };
            handleResetPMedian();
            const response = await graphAPI.pmedianGraph(request);
            console.log(`P-Median response: ${response}`);
            
            if (response.error) {
                setErrorMessage(response.error);
                return;
            }
            
            for (const facilityId of response.facilities) {
                await nodeActions.updateType(facilityId, NodeTypes.FACILITY);
            }
            
            nodeActions.updateClustersWithFacilities(response.assignments, response.facilities);
            setLastCost(response.cost);
        } catch (error) {
            console.error('P-Median failed:', error);
            alert('Failed to execute P-Median. Please try again.');
        }
    };


    

    const handleGenerate = async () => {
        try {
            const blob = await graphAPI.getCostMatrix();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cost_matrix.csv';
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error getting cost matrix:', error);
        }
    }

    const handleGenerateDemand = async () => {
        try {
            const blob = await graphAPI.getDemandMatrix();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'demand_matrix.csv';
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error getting demand matrix:', error);
        }
    }

    return (
        <>
            <label> Method: </label>
            <select value={pMedianAlgorithm} onChange={(e) => {
                setPMedianAlgorithm(e.target.value.toUpperCase() as PMedianAlgorithm)
            }}>
                <option value="GREEDY">Greedy (Kuehn & Hamburger, 1963)</option>
                <option value="INTERCHANGE">Interchange (Teitz & Bart, 1968) </option>
                <option value="CLUSTERING">Clustering based </option>
            </select>
            
            <div className="params-group">
                <label htmlFor="p">Number of facilities (p):</label>
                <input
                    id="p"
                    type="number"
                    min="1"
                    max={Math.min(
                        nodeActions.getNodes().filter(n => n.type !== NodeTypes.CONSUMER).length,
                        nodeActions.getNodes().filter(n => n.type === NodeTypes.CONSUMER).length
                    )}
                    value={p}
                    onChange={(e) => setP(+e.target.value)}
                />
                <span className="full-width-text">
                    Max facilities: {Math.min(
                        nodeActions.getNodes().filter(n => n.type !== NodeTypes.CONSUMER).length,
                        nodeActions.getNodes().filter(n => n.type === NodeTypes.CONSUMER).length
                    )}
                </span>
            
                <label htmlFor="useDemand">Use custom demand? </label>
                <input
                    id="useDemand"
                    type="checkbox"
                    checked={useDemand}
                    onChange={(e) => setUseDemand(e.target.checked)}
                />
                <span className="full-width-text">
                    Default demand is 1.0 for all customers
                </span>

                {lastCost !== null && (
                    <>
                        <label>Total Cost:</label>
                        <span className="full-width-text" style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                            {lastCost.toFixed(2)}
                        </span>
                    </>
                )}
            </div>

            <button onClick={handlePMedian}>SEARCH</button>
            <button onClick={handleResetPMedian}>RESET</button>

            <div className="params-group">
                <span> Generate cost matrix as csv: </span>
                <button onClick={handleGenerate}> Generate </button>
            </div>
            <div className="params-group">
                <span> Generate demand matrix as csv: </span>
                <button onClick={handleGenerateDemand}> Generate </button>
            </div>
        </>
    )
}