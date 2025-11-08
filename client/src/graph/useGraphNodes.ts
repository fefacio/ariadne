import { useCallback, useState } from "react"
import type { GraphEdge, GraphNode } from "./SVGCanvas";
import { type NodeType, type Position } from "../types/types";
import { graphAPI } from "./graphAPI";
import { NODE_STYLES, type NodeStyle } from "../styles";

export interface NodeActions {
    add: (x: number, y: number, type: NodeType, demand: number | null) => Promise<number>; 
    delete: (id: number) => Promise<void>;
    updatePosition: (id: number, newPosition: Position) => void;
    updateType: (id: number, type: NodeType) => Promise<void>;
    updateCluster: (nodeId: number, clusterId: number) => void;
    updateClusters: (clusters: Record<string, number>) => void;
    resetClusters: () => void;
    getById:  (id: number) => GraphNode | undefined;
    getNodes: () => GraphNode[];
    updateStyle: (id: number, style: NodeStyle) => void;
    resetStyle: (id: number) => void;
    resetStyles: () => void;
};

export const useGraphNodes = (setEdgeList: React.Dispatch<React.SetStateAction<GraphEdge[]>>) => {
    const [nodeList, setNodeList] = useState<GraphNode[]>([]);

    const addNode = useCallback(async (x: number, y: number, type: NodeType, demand: number | null) => {
        let newNodeId: number = 0;
        console.log("HELLO C");
        console.log(demand);
        console.log("NODE LIST INSIDE ADDNODE: ");
        console.log(nodeList);
        try {
            newNodeId = await graphAPI.createNode({type: type, demand: demand});
            const newNode: GraphNode = {
                id: newNodeId,
                x: x,
                y: y,
                type: type,
                demand: demand,
                style: NODE_STYLES.DEFAULT
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

    const updateClusterId = useCallback((nodeId: number, clusterId: number) => {
        setNodeList(prev => 
            prev.map(node => 
                node.id === nodeId 
                    ? { ...node, clusterId } 
                    : node
            )
        );
    }, 
    []);

    const updateAllClusters = useCallback((clusters: Record<string, number>) => {
        setNodeList(prev => 
            prev.map(node => {
                const clusterId = clusters[node.id.toString()];
                return clusterId !== undefined 
                    ? { ...node, clusterId } 
                    : node;
            })
        );
    }, 
    []);

    const resetAllClusters = useCallback(() => {
        setNodeList(prev => 
            prev.map(node => ({ ...node, clusterId: undefined }))
        );
    }, 
    []);
    
    const getNodeById = useCallback((id: number) => {
        const node = nodeList.find(node => node.id === id);
        if (!node) {
            throw new Error(`Node with id ${id} not found`);
        }
        return node;

    }, [nodeList]);

    const getAllNodes = useCallback(() => {
        return nodeList;

    }, [nodeList]);

    const updateNodeStyle = useCallback((nodeId: number, style: NodeStyle) => {
        setNodeList(prev => 
            prev.map(node => 
                node.id === nodeId 
                    ? { ...node, style } 
                    : node
            )
        );
    }, []);

    const resetNodeStyle = useCallback((nodeId: number) => {
        setNodeList(prev => 
            prev.map(node => 
                node.id === nodeId 
                    ? { ...node, style: NODE_STYLES.DEFAULT } 
                    : node
            )
        );
    }, []);

    const resetAllStyles = useCallback(() => {
        setNodeList(prev => 
            prev.map(node => ({ ...node, style: NODE_STYLES.DEFAULT }))
        );
    }, []);



    const nodeActions: NodeActions = {
        add: addNode,
        delete: deleteNode,
        updatePosition: updateNodePosition,
        updateType: updateNodeType,
        updateCluster: updateClusterId,
        updateClusters: updateAllClusters,
        resetClusters: resetAllClusters,
        getById: getNodeById,
        getNodes: getAllNodes,
        updateStyle: updateNodeStyle,
        resetStyle: resetNodeStyle,
        resetStyles: resetAllStyles
    }

    return {nodeList, setNodeList, nodeActions};
}
