import { useState } from "react";
import { useUIState } from "../../context/uiState/useUIState";
import { graphAPI } from "../graphAPI";
import { INNER_EDGE_STYLES, NODE_STYLES, OUTER_EDGE_STYLES, type NodeStyle } from "../../styles";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import type { EdgeActions } from "../useGraphEdges";
import { SvgModes } from "../../types";

const SearchMethods = {
    BFS: "BFS",
    DFS: "DFS",
    GREEDY: "GREEDY",
    DIJKSTRA: "DIJKSTRA"
} as const;

type SearchMethod = typeof SearchMethods[keyof typeof SearchMethods]

interface SearchMenuProps {
    sourceNodeId: number | null;
    targetNodeId: number | null;
    updateStyle: (id: number, style: NodeStyle) => void;
    resetStyles: () => void;
    edgeActions: EdgeActions
}

export function SearchMenu({sourceNodeId, targetNodeId, updateStyle, resetStyles, edgeActions}: SearchMenuProps) {
    const [searchMethod, setSearchMethod] = useState<SearchMethod>(SearchMethods.BFS);
    const [searchResult, setSearchResult] = useState<{
        isFound: boolean;
        pathCost?: number;
        path?: Array<{ id: number; label: string; type: string }>;
    } | null>(null);

    const uiStateContext = useUIState();


    const handleSelectSource = () => {
        if (sourceNodeId!==null) {
            updateStyle(sourceNodeId, NODE_STYLES.DEFAULT);
        }
        uiStateContext.setMode(SvgModes.SELECT_NODE);
        uiStateContext.setSelectingNodeFor('source');
    };

    const handleSelectTarget = () => {
        if (targetNodeId!==null) {
            updateStyle(targetNodeId!, NODE_STYLES.DEFAULT);
        }
        uiStateContext.setMode(SvgModes.SELECT_NODE);
        uiStateContext.setSelectingNodeFor('target');
    };

    const handleSearchGraph = async () => {
        if (sourceNodeId === null || targetNodeId === null) {
            alert('Please select both source and target nodes');
            return;
        }

        try {
            const searchRequest = {
                method: searchMethod,
                sourceId: sourceNodeId,
                targetId: targetNodeId
            };

            const response = await graphAPI.searchGraph(searchRequest);
            
            if (response.found) {
                resetStyles();
                edgeActions.resetStyles();
                response.path.forEach((node) => {
                    updateStyle(node.id, NODE_STYLES.SEARCH);
                })
                const uniqueEdges = edgeActions.getUnique();

                for (let i=0; i<response.path.length- 1; i++){
                    const sourceNode = response.path[i];
                    const targetNode = response.path[i+1];

                    const edge = uniqueEdges.find(e => 
                        (e.sourceId === sourceNode.id && e.targetId === targetNode.id) ||
                        (e.sourceId === targetNode.id && e.targetId === sourceNode.id)
                    )

                    if (edge) {
                        edgeActions.updateStyle(edge.id, INNER_EDGE_STYLES.SEARCHING, true);
                        edgeActions.updateStyle(edge.id, OUTER_EDGE_STYLES.SEARCHING, false);
                    }
                }
                setSearchResult({
                    isFound: true,
                    pathCost: response.cost,
                    path: response.path
                });

            } else {
                setSearchResult({
                    isFound: false,
                    pathCost: undefined,
                    path: []
                });
                alert('No path found between the selected nodes');
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            alert('Failed to execute search. Please try again.');
        }
    };

    const handleGenerate = async () => {
        try {
            const blob = await graphAPI.getDistanceMatrix();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nodes_distances.csv';
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error geting distance matrix:', error);
        }
    }
    
    return (
        <>
            <label> Method: </label>
            <select value={searchMethod} onChange={(e) => {
                setSearchMethod(e.target.value.toUpperCase() as SearchMethod)
            }}>
                <option value="BFS">Breadth First Search</option>
                <option value="DFS">Depth First Search</option>
                <option value="GREEDY">Greedy Best-first Search</option>
                <option value="DIJKSTRA">Dijkstra</option>
            </select>

            <div>
                <label>Source Node: </label>
                <input 
                    type="text" 
                    value={sourceNodeId !== null ? sourceNodeId : ''} 
                    readOnly 
                    placeholder="Click button to select"
                    style={{ marginRight: '0.5rem', padding: '0.25rem' }}
                />
                <button onClick={handleSelectSource}>
                    Select Source
                </button>
            </div>

            <div>
                <label>Target Node: </label>
                <input 
                    type="text" 
                    value={targetNodeId !== null ? targetNodeId : ''} 
                    readOnly 
                    placeholder="Click button to select"
                    style={{ marginRight: '0.5rem', padding: '0.25rem' }}
                />
                <button onClick={handleSelectTarget}>
                    Select Target
                </button>
            </div>
            <button onClick={handleSearchGraph}>SEARCH</button>
            
            {searchResult && (
                <CollapsibleSection title="SEARCH RESULTS"> 
                    <div>
                        <div className="params-group">
                            {searchResult.isFound && (
                                <>
                                <span> Cost: </span>
                                <span> {searchResult.pathCost} </span>

                                <span> Path: </span>
                                <span> {searchResult.path?.map(node => node.id).join(", ")} </span>
                                </>
                                
                            )}

                        </div>
                    </div>
                </CollapsibleSection>
            
            )}
            <div className="params-group">
                <span> Generate distances matrix as csv: </span>
                <button onClick={handleGenerate}> Generate </button>

            </div>

            
        </>
       
    )
}