import { useCallback, useEffect, useRef, useState } from "react"
import { type NodeType, type Position } from "../types";
import { graphAPI } from "./graphAPI";
import { NODE_STYLES, type NodeStyle } from "../styles";
import type { GraphEdge } from "./useGraphEdges";
import { useGlobalConfig } from "../context/globalConfig/useGlobalConfig";


export interface GraphNode  {
    id: number;
    x: number;
    y: number;
    type: NodeType;
    demand: number | null;
    style: NodeStyle;
    label?: string;
    clusterId?: number;
};


export interface NodeActions {
    add: (x: number, y: number, type: NodeType, demand: number | null) => Promise<number>; 
    delete: (id: number) => Promise<void>;
    updatePosition: (id: number, newPosition: Position) => void;
    updateType: (id: number, newType: NodeType) => Promise<void>;
    updateDemand: (id: number, newDemand: number | null) => Promise<void>;
    updateLabel: (id: number, label: string) => void;
    updateLabels: () => void;
    updateCluster: (nodeId: number, clusterId: number) => void;
    updateClusters: (clusters: Record<string, number>) => void;
    updateClustersWithFacilities: (assignments: Record<string, number>, facilities: number[]) => void;
    resetClusters: () => void;
    getById:  (id: number) => GraphNode | undefined;
    getNodes: () => GraphNode[];
    setNodes: (nodes: GraphNode[]) => void;
    updateStyle: (id: number, style: NodeStyle) => void;
    resetStyle: (id: number) => void;
    resetStyles: () => void;
    isEmpty: () => boolean;
};

export const useGraphNodes = (setEdgeList: React.Dispatch<React.SetStateAction<GraphEdge[]>>) => {
    const [nodeList, setNodeList] = useState<GraphNode[]>([]);
    const nodeListRef = useRef<GraphNode[]>([]);
    const config = useGlobalConfig();

    useEffect(() => {
        nodeListRef.current = nodeList;
    }, [nodeList]);

    const addNode = useCallback(async (x: number, y: number, type: NodeType, demand: number | null) => {
        let response = null;
        try {
            response = await graphAPI.createNode({type: type, demand: demand});
            let label = "";
            if (config.showLabel) {
                label = config.useIdAsLabel 
                    ? `${response.id}` 
                    : `${nodeListRef.current.length + 1}`;  // Próximo número na sequência
            }
    
            const newNode: GraphNode = {
                id: response.id,
                x: x,
                y: y,
                type: response.type as NodeType,
                demand: response.demand,
                style: NODE_STYLES.DEFAULT,
                label: label,
            }
            setNodeList(prev => [...prev, newNode]);

        } catch (error) {
            console.error("[ERROR] WHILE CREATING NODE: "+error);
            throw error;
        }
        return response.id;
    }, 
    [config.showLabel, config.useIdAsLabel]);

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
        setNodeList(prev =>
            prev.map(node =>
                node.id === id ? { ...node, x: newPosition.x, y: newPosition.y } : node
            )
        );
    }, []);

    const updateNodeType = useCallback(async (id: number, newType: NodeType) => {
        try {
            const response = await graphAPI.updateNode(id, {type: newType});
            setNodeList(prev => {
                const updatedList = prev.map(node => {
                    if (node.id === id) {
                        const newDemand = newType !== 'CONSUMER' ? null : 1.0;
                        return { ...node, type: response.type as NodeType, demand: newDemand };
                    }
                    return node;
                });
                return updatedList;
            });
        } catch(error) {
            console.error("[ERROR] WHILE UPDATING NODE TYPE: "+error);
            throw error;
        }
       
    }, 
    []);


    const updateNodeDemand = useCallback(async (id: number, newDemand: number | null) => {
        try {
            const response = await graphAPI.updateNode(id, {demand: newDemand});
            setNodeList(prev => 
                prev.map(node =>
                    node.id === id ? { ...node, demand: response.demand } : node
                )
            );
        } catch(error) {
            console.error("[ERROR] WHILE UPDATING NODE DEMAND: "+error);
            throw error;
        }
    }, []);

    const updateNodeLabel = useCallback((nodeId: number, label: string) => {
        setNodeList(prev => 
            prev.map(node => 
                node.id === nodeId 
                    ? { ...node, label } 
                    : node
            )
        );
    }, 
    []);

    const updateAllLabels = useCallback(() => {
        setNodeList(prev => 
            prev.map((node, index) => ({
                ...node,
                label: config.showLabel
                    ? (config.useIdAsLabel ? `${node.id}` : `${index + 1}`)
                    : ""
            }))
        );
    }, [config.showLabel, config.useIdAsLabel]);

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

    const updateAllClustersWithFacilities = useCallback((assignments: Record<string, number>, facilities: number[]) => {
        setNodeList(prev => 
            prev.map(node => {
                if (facilities.includes(node.id)) {
                    return { ...node, clusterId: node.id };
                }
                
                const facilityId = assignments[node.id.toString()];
                if (facilityId !== undefined) {
                    return { ...node, clusterId: facilityId };
                }
                
                return node;
            })
        );
    }, []);

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
        return nodeListRef.current;  
    }, []);

    const setAllNodes = useCallback((nodes: GraphNode[]) => {
        setNodeList(nodes);
    }, []);

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

    const isNodeListEmpty = useCallback(() => {
        return nodeListRef.current.length == 0;
    }, [])



    const nodeActions: NodeActions = {
        add: addNode,
        delete: deleteNode,
        updatePosition: updateNodePosition,
        updateType: updateNodeType,
        updateDemand: updateNodeDemand,
        updateLabel: updateNodeLabel,
        updateLabels: updateAllLabels,
        updateCluster: updateClusterId,
        updateClusters: updateAllClusters,
        updateClustersWithFacilities: updateAllClustersWithFacilities,
        resetClusters: resetAllClusters,
        getById: getNodeById,
        getNodes: getAllNodes,
        setNodes: setAllNodes,
        updateStyle: updateNodeStyle,
        resetStyle: resetNodeStyle,
        resetStyles: resetAllStyles,
        isEmpty: isNodeListEmpty
    }

    return {nodeList, setNodeList, nodeActions};
}
