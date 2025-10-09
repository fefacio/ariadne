import { useCallback, useState } from "react"
import type { GraphEdge, GraphNode } from "./SVGCanvas";
import { type NodeType, type Position } from "../types/types";
import { graphAPI } from "./graphAPI";

export interface NodeActions {
    add: (x:number, y:number, type:NodeType) => Promise<number>; 
    delete: (id: number) => Promise<void>;
    updatePosition: (id: number, newPosition: Position) => void;
    updateType: (id: number, type: NodeType) => Promise<void>;
    getById:  (id: number) => GraphNode | undefined;
};

export const useGraphNodes = (setEdgeList: React.Dispatch<React.SetStateAction<GraphEdge[]>>) => {
    const [nodeList, setNodeList] = useState<GraphNode[]>([]);
    
    const addNode = useCallback(async (x: number, y: number, type: NodeType) => {
        let newNodeId: number = 0;
        try {
            newNodeId = await graphAPI.createNode({type: type});
            const newNode: GraphNode = {
                id: newNodeId,
                x: x,
                y: y,
                type: type
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
                node.id === id ? { ...node, x: newPosition.x, y: newPosition.y } : node
            )
        );
    }, []);

    const updateNodeType = useCallback(async (id: number, newType: NodeType) => {
        try {
            await graphAPI.updateNode(id, {type: newType});
            console.log("NewType:"+newType);
            setNodeList(prev => {
                const updatedList = prev.map(node =>
                    node.id === id ? { ...node, type: newType } : node
                );
                for (const node of updatedList) {
                    console.log("node-id: " + node.id + " type: " + node.type);
                }
                return updatedList;
            });
        } catch(error) {
            console.error("[ERROR] WHILE CREATING NODE: "+error);
            throw error;
        }
       
    }, 
    []);
    
    const getNodeById = useCallback((id: number) => {
        const node = nodeList.find(node => node.id === id);
        if (!node) {
            throw new Error(`Node with id ${id} not found`);
        }
        return node;
    }, [nodeList]);



    const nodeActions: NodeActions = {
        add: addNode,
        delete: deleteNode,
        updatePosition: updateNodePosition,
        updateType: updateNodeType,
        getById: getNodeById
    }

    return {nodeList, setNodeList, nodeActions};
}
