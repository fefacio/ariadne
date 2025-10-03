import { useCallback, useState } from "react"
import type { GraphEdge } from "./SVGCanvas";
import { graphAPI } from "./graphAPI";

export interface EdgeActions {
    add: (node1Id:number, node2Id:number, weight?: number) => Promise<void>; 
    delete: (id: number) => Promise<void>;
    getById:  (id: number) => GraphEdge | undefined;
};

export const useGraphEdges = () => {
    const [edgeList, setEdgeList] = useState<GraphEdge[]>([]);
    
    const addEdge = useCallback(async (node1Id: number, node2Id: number, weight: number = 1) => {
        try {
            const newEdgeId = await graphAPI.createEdge({
                "sourceId": node1Id,
                "targetId": node2Id,
            });
        
            const newEdge: GraphEdge = {
                id: newEdgeId,
                sourceId: node1Id,
                targetId: node2Id,
                weight: weight
            }
            setEdgeList(prev => [...prev, newEdge]);
        } catch (error) {
            console.error("[ERROR] WHILE CREATING EDGE: "+error);
            throw error;
        }
    }, 
    []);

    const deleteEdge = useCallback(async (id: number) => {
        try {
            await graphAPI.deleteEdge(id);
            setEdgeList(prev => prev.filter(edge => edge.id !== id));
        } catch (error) {
            console.error("[ERROR] WHILE DELETING EDGE:", error);
            throw error;
        }
    }, []);


    
    const getEdgeById = useCallback((id: number) => {
        return edgeList.find(edge => edge.id === id);
    }, [edgeList]);


    const edgeActions: EdgeActions = {
        add: addEdge,
        delete: deleteEdge,
        getById: getEdgeById
    }

    return {edgeList, setEdgeList, edgeActions};
}