/*
Adicionar uma aresta entre dois nois, vai criar dois objetos arestas com origem e destinos alternados.
Isto é feito para facilitar implementação no backend, utilizando lista de adjacência e matriz de adjacência, 
visto que a reciproca em grafos não direcionados sempre existe, ou seja, existe uma aresta que sai do no 1
e vai para o no 2 visto que tambem existe a aresta que sai do no 2 e vai para o 1
Lista:
Node    Edges
1    -> 2
2    -> 1
Matrix:
   1 2
1[ 1 1]
2[ 1 1]
----FLUXO
--FRONTEND:
ADICIONOR NODE 1 E NODE 2
--BACKEND:
POST NODE 1
POST NODE 2
--FRONTEND:
CONECTAR ARESTA - EDGE 1 (SOURCE NODE ID 1 | TARGET NODE ID 2)
--BACKEND:
POST EDGE 1
[AUTO] POST EDGE 2 (SOURCE NODE ID 2 | TARGET NODE ID 1)
--FRONT END:
DELETAR EDGE 1
*quando o usuario clica na aresta, ele automaticamente vai selecionar as duas duplicatas
e vai enviar duas requisições de delete pro backend. Na hora de exibir para o usuário o grafo,
somente uma aresta é exibida para otimização.*
--BACKEND:
DELETE EDGE 1
DELETE EDGE 2
*/

import { useCallback, useEffect, useRef, useState } from "react"
import { graphAPI } from "./graphAPI";
import { INNER_EDGE_STYLES, OUTER_EDGE_STYLES, type EdgeStyle } from "../styles";


export interface GraphEdge {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
    innerStyle: EdgeStyle;
    outerStyle: EdgeStyle;
};


export interface EdgeActions {
    add: (node1Id:number, node2Id:number, weight?: number) => Promise<void>; 
    delete: (sourceId: number, targetId: number) => Promise<void>;
    updateWeight: (id: number, newWeight: number) => Promise<void>;
    getUnique: () => GraphEdge[];
    getById:  (id: number) => GraphEdge;
    getPair: (edgeId: number) => ( number | undefined)[];
    getEdges: () => GraphEdge[];
    setEdges: (edges: GraphEdge[]) => void;
    updateStyle: (id: number, style: EdgeStyle, isInner: boolean) => void;
    resetStyle: (id: number) => void;
    resetStyles: () => void;
};

export const useGraphEdges = () => {
    const [edgeList, setEdgeList] = useState<GraphEdge[]>([]);
    const edgeListRef = useRef<GraphEdge[]>([]);

    useEffect(() => {
        edgeListRef.current = edgeList;
    }, [edgeList]);
    
    const addEdge = useCallback(async (node1Id: number, node2Id: number, weight: number = 1) => {
        try {
            const currentEdgeList = await new Promise<GraphEdge[]>((resolve) => {
                setEdgeList(prev => {
                    resolve(prev);
                    return prev;
                });
            });
            const existingConnection = currentEdgeList.some(edge => 
                edge.sourceId === node1Id && edge.targetId === node2Id
            );

            if (existingConnection) {
                throw new Error(`Connection between nodes ${node1Id} and ${node2Id} already exists`);
            }


            const createdEdges = await graphAPI.createEdge({
                sourceId: node1Id,
                targetId: node2Id,
                weight: weight
            });

            const newEdges: GraphEdge[] = createdEdges.map(edge => ({
                id: edge.id,
                sourceId: edge.sourceId,
                targetId: edge.targetId,
                weight: edge.weight,
                innerStyle: INNER_EDGE_STYLES.DEFAULT,
                outerStyle: OUTER_EDGE_STYLES.DEFAULT
            }));

            setEdgeList(prev => [...prev, ...newEdges]);
            
            
        } catch (error) {
            console.error("[ERROR] WHILE CREATING EDGE: "+error);
            throw error;
        }
    }, 
    []);
    /* MUITO CUIDADO COM PROMISE.ALL
    criou race condition de deleção no backend forçando a executar o synchronized
    e garantir que o metodo seje executado uma vez por thread
    */
    const deleteEdge = useCallback(async (sourceId: number, targetId: number) => {
        try {
            const edgesToDelete = edgeList.filter(edge => 
                (edge.sourceId === sourceId && edge.targetId === targetId) ||
                (edge.sourceId === targetId && edge.targetId === sourceId)
            );
            // await Promise.all(
            //     edgesToDelete.map(edge => graphAPI.deleteEdge(edge.id)));
            for (const edge of edgesToDelete) {
                try {
                    await graphAPI.deleteEdge(edge.id);
                } catch (error) {
                    console.error(`[deleteEdge] Failed to delete edge ID ${edge.id}:`, error);
                    // Continua mesmo com erro
                }
            }

            setEdgeList(prevEdges => {
                const newEdges = prevEdges.filter(edge => 
                    !edgesToDelete.some(deletedEdge => deletedEdge.id === edge.id)
                );
                return newEdges;
            });

        } catch (error) {
            console.error("[ERROR] WHILE DELETING EDGE:", error);
            throw error;
        }
    }, [edgeList]);

    const updateEdgeWeight = useCallback(async (id: number, newWeight: number) => {
        try {
            const edge = edgeList.find(edge => edge.id === id);
            if (edge!==undefined){
                await graphAPI.updateEdge(id, {sourceId: edge.sourceId, targetId: edge.targetId, weight: newWeight}); 
                setEdgeList(prev =>
                    prev.map(edge =>
                        edge.id === id ? { ...edge, weight: newWeight } : edge
                    )
                );
            } else {
                console.error("[ERROR] WRONG EDGE ID");
            }
            
        } catch (error) {
            console.error("[ERROR] WHILE UPDATING EDGE WEIGHT:", error);
            throw error;
        }
    }, [edgeList]);

    
    const getEdgeById = useCallback((id: number) => {
        const edge = edgeList.find(edge => edge.id === id);
        if (!edge){
            throw new Error(`Edge with id ${id} not found`);
        }

        return edge;
    }, [edgeList]);

    const getEdgePair = useCallback((edgeId: number) => {
        const edge = getEdgeById(edgeId);
        const reverse = edgeList.find(
            (e) => e.sourceId === edge.targetId && e.targetId === edge.sourceId
        );
        return [edgeId, reverse?.id]
    },
    [edgeList, getEdgeById])


    const getAllEdges = useCallback(() => {
        return edgeListRef.current;  
    }, []);  

    const setAllEdges = useCallback((edges: GraphEdge[]) => {
        setEdgeList(edges);
    }, []);

    const normalizeEdge = useCallback((sourceId: number, targetId: number) => {
        return sourceId < targetId 
            ? { source: sourceId, target: targetId }
            : { source: targetId, target: sourceId };
    }, 
    []);

    const getUniqueEdges = useCallback(() => {
        const seen = new Set<string>();
        return edgeList.filter(edge => {
            const normalized = normalizeEdge(edge.sourceId, edge.targetId);
            const key = `${normalized.source}-${normalized.target}`;
            
            if (seen.has(key)) {
                return false
            }
            seen.add(key);
            return true;
        });
    },
    [normalizeEdge, edgeList]);

    

    const updateEdgeStyle = useCallback((edgeId: number, style: EdgeStyle, isInner: boolean) => {
            setEdgeList(prev => 
                prev.map(edge => 
                    edge.id === edgeId 
                        ? isInner
                            ? { ...edge, innerStyle: style } 
                            : { ...edge, outerStyle: style}
                        : edge
                )
            );
        }, []);
    
        const resetEdgeStyle = useCallback((nodeId: number) => {
            setEdgeList(prev => 
                prev.map(edge => 
                    edge.id === nodeId 
                        ? { ...edge, innerStyle: INNER_EDGE_STYLES.DEFAULT, outerStyle: OUTER_EDGE_STYLES.DEFAULT } 
                        : edge
                )
            );
        }, []);
    
        const resetAllStyles = useCallback(() => {
            setEdgeList(prev => 
                prev.map(edge => ({ ...edge, innerStyle: INNER_EDGE_STYLES.DEFAULT, outerStyle: OUTER_EDGE_STYLES.DEFAULT }))
            );
        }, []);


    const edgeActions: EdgeActions = {
        add: addEdge,
        delete: deleteEdge,
        updateWeight: updateEdgeWeight,
        getUnique: getUniqueEdges,
        getById: getEdgeById,
        getPair: getEdgePair,
        getEdges: getAllEdges,
        setEdges: setAllEdges,
        updateStyle: updateEdgeStyle,
        resetStyle: resetEdgeStyle,
        resetStyles: resetAllStyles
    }

    return {edgeList, setEdgeList, edgeActions};
}