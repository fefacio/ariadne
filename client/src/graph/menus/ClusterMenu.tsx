import { useState } from "react";
import { graphAPI } from "../graphAPI";
import type { NodeActions } from "../useGraphNodes";


interface ClusterMenuProps {
    nodeActions: NodeActions;
}

export function ClusterMenu({nodeActions}: ClusterMenuProps) {
    const [clusterParams, setClusterParams] = useState({
        k: 2,
        maxIterations: 10000,
        maxTrials: 10
    });
    //const sessionContext = useSession();
    //const uiStateContext = useUIState();
    

    const handleClusterGraph = async () => {
       try {
            const response = await graphAPI.clusterGraph(clusterParams);
            
            console.log('Cluster result:', response);
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