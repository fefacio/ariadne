import { useState } from "react";
import { graphAPI } from "../graphAPI";
import type { NodeActions } from "../useGraphNodes";
import { resetClusterColors } from "../../colors";


interface ClusterMenuProps {
    nodeActions: NodeActions;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ClusterMenu({nodeActions, setErrorMessage}: ClusterMenuProps) {
    const [clusterParams, setClusterParams] = useState({
        k: 2,
        maxIterations: 10000,
        maxTrials: 10
    });
    
    const handleClusterGraph = async () => {
        if (clusterParams.k>=nodeActions.getNodes().length){
            setErrorMessage(`Number of clusters must not be greater or equal than the number of nodes`);
            return;
        }
        try {
            const response = await graphAPI.clusterGraph(clusterParams);
            
            if (response.success) {
                console.log(`Clusters: ${response.clusters}`);
                nodeActions.updateClusters(response.clusters);
            } 
        } catch (error) {
            console.error('Clustering failed:', error);
            alert('Failed to execute clustering. Please try again.');
        }
    };

    const handleResetClusters = () => {
        resetClusterColors();
        nodeActions.resetClusters();
    };
    
    return (
        <>
            <div className="params">
                <label htmlFor="k">Number of clusters: </label>
                <input
                    id="kr"
                    type="number" 
                    value={clusterParams.k} 
                    onChange={(e) => setClusterParams({ ...clusterParams, k: +e.target.value })}
                />
                <span className="full-width-text">
                    Max: {nodeActions.getNodes().length-1}
                </span>

                <label htmlFor="maxIterations">Max K-Means Iterations: </label>
                <input
                    id="maxIterations"
                    type="number" 
                    value={clusterParams.maxIterations} 
                    onChange={(e) => setClusterParams({ ...clusterParams, maxIterations: +e.target.value })}
                />


                <label htmlFor="maxTrials">Perform K-Means how many times?: </label>
                <input
                    id="maxTrials"
                    type="number" 
                    value={clusterParams.maxTrials} 
                    onChange={(e) => setClusterParams({ ...clusterParams, maxTrials: +e.target.value })}
                />


            </div>

            <button onClick={handleClusterGraph}>CLUSTER</button>
            <button onClick={handleResetClusters}>RESET</button>
        </>
       
    )
}