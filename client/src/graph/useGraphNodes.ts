import { useCallback, useState } from "react"
import type { GraphEdge, GraphNode } from "./SVGCanvas";
import { type Position } from "../types/types";
import { graphAPI } from "./graphAPI";

export interface NodeActions {
    add: (x:number, y:number) => Promise<number>; 
    delete: (id: number) => Promise<void>;
    updatePosition: (id: number, newPosition: Position) => void;
    getById:  (id: number) => GraphNode | undefined;
};

export const useGraphNodes = (setEdgeList: React.Dispatch<React.SetStateAction<GraphEdge[]>>) => {
    const [nodeList, setNodeList] = useState<GraphNode[]>([]);
    
    const addNode = useCallback(async (x: number, y: number) => {
        let newNodeId: number = 0;
        try {
            newNodeId = await graphAPI.createNode({});
            const newNode: GraphNode = {
                id: newNodeId,
                cx: x,
                cy: y,
            }
            setNodeList(prev => [...prev, newNode]);
        } catch (error) {
            console.error("[ERROR] WHILE CREATING NODE: "+error);
            throw error;
        }
        return newNodeId;
    }, 
    []);

    const deleteNode = useCallback(async (nodeId: number) => {
        try {
            await graphAPI.deleteNode(nodeId);
            setNodeList(prev => prev.filter(node => node.id !== nodeId));
            setEdgeList(prev => prev.filter(edge => 
                edge.sourceId !== nodeId && edge.targetId !== nodeId
            ));
        } catch (error) {
            console.error("[ERROR] WHILE DELETING NODE:", error);
            throw error;
        }
    }, [setEdgeList]);

    const updateNodePosition = useCallback((id: number, newPosition: Position) => {
        console.log("newPosition:"+newPosition.x)
        setNodeList(prev =>
            prev.map(node =>
                node.id === id ? { ...node, cx: newPosition.x, cy: newPosition.y } : node
            )
        );
    }, []);
    
    const getNodeById = useCallback((id: number) => {
        return nodeList.find(node => node.id === id);
    }, [nodeList]);


    const nodeActions: NodeActions = {
        add: addNode,
        delete: deleteNode,
        updatePosition: updateNodePosition,
        getById: getNodeById
    }

    return {nodeList, setNodeList, nodeActions};
}
