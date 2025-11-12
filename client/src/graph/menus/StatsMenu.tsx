import { useUIState } from "../../context/uiState/useUIState";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { statsAPI, type GraphStatsResponse, type NodeStatsResponse } from "../statsAPI";
import { useState } from "react";
import { SvgModes } from "../../types";
import type { NodeActions } from "../useGraphNodes";


interface StatsMenuProps {
    nodeActions: NodeActions;
    statsNodeId: number | null;
    resetStyles : () => void;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function StatsMenu({nodeActions, statsNodeId, resetStyles, setErrorMessage}: StatsMenuProps) {
    const uiStateContext = useUIState();

    const [nodeStats, setNodeStats] = useState<NodeStatsResponse | null>(null);
    const [graphStats, setGraphStats] = useState<GraphStatsResponse | null>(null);
    
    const handleSelectNode = () => {
        resetStyles();
        uiStateContext.setMode(SvgModes.SELECT_NODE);
        uiStateContext.setSelectingNodeFor("stats");
    };

    const hanldeNodeStats = async () => {
        if (statsNodeId===null) return;
        
        try {
            const response = await statsAPI.getNodeStats(statsNodeId);
            setNodeStats(response);
            
        } catch (error) {
            if (error instanceof Error)
            setErrorMessage("Graph is not connected");
            console.error("Get Node Stats failed", error);
        }
    }

    const hanldeGraphStats = async () => {
        if (nodeActions.isEmpty()){
            setErrorMessage("Graph is empty!");
            return; 
        }
        try {
            const response = await statsAPI.getGraphStats();
            setGraphStats(response);
            
        } catch (error) {
            if (error instanceof Error)
            setErrorMessage("Graph is not connected");
            console.error("Get Graph Stats failed:", error);
        }
    }

    const handleNodesReport = async () => {
        if (nodeActions.isEmpty()){
            setErrorMessage("Graph is empty!");
            return; 
        }
        try {
            const blob = await statsAPI.getNodesReport();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nodes_report.csv';
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            if (error instanceof Error)
            setErrorMessage("Graph is not connected");
            console.error('Error downloading report:', error);
        }
    };



    return (
        <>
            <div className="params">
                <CollapsibleSection title="Node">
                    <div className="params-group common"> 
                        <label>Source Node: </label>
                        <input 
                            type="text" 
                            value={statsNodeId !== null ? statsNodeId : ''} 
                            readOnly 
                            placeholder="Click button to select"
                            style={{ marginRight: '0.5rem', padding: '0.25rem' }}
                        />
                        <button onClick={handleSelectNode}>
                            Select Node
                        </button>
                        {statsNodeId!==null && (
                            <button onClick={hanldeNodeStats}>
                                Compute stats
                            </button>
                        )}
                    </div>
                    <div>
                        <span> Get all nodes statistics as .csv</span>
                        <button onClick={handleNodesReport}>
                            Download
                        </button>
                    </div>
                    
                    {nodeStats!==null && (
                        <div className="params-group node-stats">
                            <span>Id: </span> <span> {nodeStats.id} </span>
                            <span>Type: </span> <span> {nodeStats.type} </span>
                            <span>Degree: </span> <span> {nodeStats.degree} </span>
                            <span>Normalized Degree: </span> <span> {nodeStats.normalizedDegree} </span>
                            <span>Strength: </span> <span> {nodeStats.strength} </span>
                            <span>Normalized Strength: </span> <span> {nodeStats.normalizedStrength} </span>
                            <span>Neighbors: </span> <span>  {nodeStats.neighborIds.join(", ")}  </span>
                            <span>Betweenness: </span> <span> {nodeStats.betweennessCentrality} </span>
                            <span>Closeness: </span> <span> {nodeStats.closenessCentrality} </span>
                            <span>Average Path Length: </span> <span> {nodeStats.averagePathLength} </span>
                            <span>Clustering Coefficient: </span> <span> {nodeStats.clusteringCoefficient} </span>
                            <span>Eccentricity: </span> <span> {nodeStats.eccentricity} </span>
                        </div>
                    )}
                </CollapsibleSection>

                <CollapsibleSection title="Graph">
                    <div className="params-group common"> 
                        <button onClick={hanldeGraphStats}>
                                Compute stats
                        </button>
                    </div>
                    {graphStats!==null && (
                        <div className="params-group node-stats">
                            <span>Number of nodes: </span> <span> {graphStats.numberOfNodes} </span>
                            <span>Number of edges: </span> <span> {graphStats.numberOfEdges} </span>
                            <span>Number of consumers: </span> <span> {graphStats.numberOfConsumers} </span>
                            <span>Number of candidates: </span> <span> {graphStats.numberOfCandidates} </span>
                            <span>Average demand: </span> <span> {graphStats.avgDemand} </span>
                            <span>Min degree: </span> <span> {graphStats.minDegree} </span>
                            <span>Max degree: </span> <span> {graphStats.maxDegree} </span>
                            <span>Average degree: </span> <span> {graphStats.avgDegree} </span>
                            <span>Min strength: </span> <span> {graphStats.minStrength} </span>
                            <span>Max strength: </span> <span> {graphStats.maxStrength} </span>
                            <span>Average strength: </span> <span> {graphStats.avgStrength} </span>
                            <span>Density: </span> <span> {graphStats.density} </span>
                            <span>Radius: </span> <span> {graphStats.radius} </span>
                            <span>Diameter: </span> <span> {graphStats.diamater} </span>
                            <span>Average clustering coefficient: </span> <span> {graphStats.avgClusteringCoefficient} </span>
                            <span>Average path length: </span> <span> {graphStats.avgPathLength} </span>
                            <span>Average Degree Centrality: </span> <span> {graphStats.avgDegreeCentrality} </span>
                            <span>Average Strength Centrality: </span> <span> {graphStats.avgStrengthCentrality} </span>
                            <span>Average Closeness Centrality: </span> <span> {graphStats.avgClosenessCentrality} </span>
                            <span>Average Betweenness Centrality: </span> <span> {graphStats.avgBetweennessCentrality} </span>

                        </div>
                    )}

                </CollapsibleSection>
            </div>

            
        </>
       
    )
}