import { useUIState } from "../../context/uiState/useUIState";
import { useSession } from "../../context/session/useSession";
import { Modes } from "../../types/types";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { statsAPI, type NodeStatsResponse } from "../statsAPI";
import { useState } from "react";


interface StatsMenuProps {
    statsNodeId: number | null;
    resetStyles : () => void;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function StatsMenu({statsNodeId, resetStyles, setErrorMessage}: StatsMenuProps) {
    const sessionContext = useSession();
    const uiStateContext = useUIState();

    const [nodeStats, setNodeStats] = useState<NodeStatsResponse | null>(null);
    
    const handleSelectNode = () => {
        resetStyles();
        sessionContext.setMode(Modes.SELECT_NODE);
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
            console.error('Search failed:', error);
        }
    }

    const handleNodesReport = async () => {
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
                            <span>Label: </span> <span> {nodeStats.label ? nodeStats.label : "null"} </span>
                            <span>Type: </span> <span> {nodeStats.type} </span>
                            <span>Degree: </span> <span> {nodeStats.degree} </span>
                            <span>Normalized Degree: </span> <span> {nodeStats.normalizedDegree} </span>
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
                        <button onClick={hanldeNodeStats}>
                                Compute stats
                        </button>
                    </div>

                </CollapsibleSection>
            </div>

            
        </>
       
    )
}