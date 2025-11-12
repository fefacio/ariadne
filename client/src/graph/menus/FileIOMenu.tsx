import React, { useCallback, useState } from "react";
import "./Menus.css";
import { generateGridPositions } from "../generation/generationGrid";
import { type NodeType } from "../../types";
import { graphAPI } from "../graphAPI";
import { INNER_EDGE_STYLES, NODE_STYLES, OUTER_EDGE_STYLES } from "../../styles";
import type { EdgeActions, GraphEdge } from "../useGraphEdges";
import type { GraphNode, NodeActions } from "../useGraphNodes";
import { DEFAULT_VIEWBOX_RIGHT_PADDING, DEFAULT_VIEWBOX_TOP_PADDING } from "../../constants";

interface NodeJson {
    id: number;
    type: string;
    demand: number | null;
};

interface EdgeJson {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
};

const FileIOTypes = {
    SAVE: "SAVE",
    OPEN_FILE: "OPEN_FILE"
} as const;

type FileIOType = typeof FileIOTypes[keyof typeof FileIOTypes]

const FileFormats = {
    JSON: "JSON",
    JSON_COMPLETE: "JSON_COMPLETE",
    TIKZ: "TIKZ"
} as const;

type FileFormat = typeof FileFormats[keyof typeof FileFormats]

interface FileIoMenuProps {
    nodeList: GraphNode[];
    nodeActions: NodeActions;
    edgeActions: EdgeActions;
    setNodeList: React.Dispatch<React.SetStateAction<GraphNode[]>>;
    setEdgeList: React.Dispatch<React.SetStateAction<GraphEdge[]>>;
    viewBox: { x: number, y: number, width: number, height: number };
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function FileIOMenu({nodeList, nodeActions, edgeActions, setNodeList, setEdgeList, viewBox, setErrorMessage}: FileIoMenuProps) {
    const [fileIOType, setFileIOType] = useState<FileIOType>(FileIOTypes.SAVE);
    const [fileFormat, setFileFormat] = useState<FileFormat>(FileFormats.JSON);
    const [fileSaveParams, setFileSaveParams] = useState({
        filename: "graph"
    });

    const handleSave = useCallback(() => {
        if (nodeActions.isEmpty()){
            setErrorMessage("Graph is empty!");
            return;
        }
        const uniqueEdges = edgeActions.getUnique();
        const isWeighted = uniqueEdges.reduce((acc, edge) => acc * edge.weight, 1) !== 1;
        
        if (fileFormat === FileFormats.JSON) {
            const data = {
                nodes: nodeList.map(node => ({
                    id: node.id,
                    label: "",
                    type: node.type,
                    demand: node.demand,
                })),
                edges: uniqueEdges.map(edge => ({
                    id: edge.id,
                    sourceId: edge.sourceId,
                    targetId: edge.targetId,
                    weight: edge.weight
                }))
            };

            const jsonString = JSON.stringify(data, null, 2);
            
            // Download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileSaveParams.filename || 'graph'}.json`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else if (fileFormat === FileFormats.JSON_COMPLETE){
            const data = {
                nodes: nodeList.map(node => ({
                    id: node.id,
                    x: node.x,
                    y: node.y,
                    type: node.type,
                    demand: node.demand,
                    style: node.style,
                    label: node.label,
                    clusterId: node.clusterId
                })),
                edges: uniqueEdges.map(edge => ({
                    id: edge.id,
                    sourceId: edge.sourceId,
                    targetId: edge.targetId,
                    weight: edge.weight,
                    innerStyle: edge.innerStyle,
                    outerStyle: edge.outerStyle
                }))
            };

            const jsonString = JSON.stringify(data, null, 2);
            // Download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileSaveParams.filename || 'graph'}_complete.json`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        }  else if (fileFormat === FileFormats.TIKZ) {
            
            // Nroamlize nodes positions between [0-5]
            const minX = Math.min(...nodeList.map(n => n.x));
            const maxX = Math.max(...nodeList.map(n => n.x));
            const minY = Math.min(...nodeList.map(n => n.y));
            const maxY = Math.max(...nodeList.map(n => n.y));
            const normalizeX = (x: number) => ((x - minX) / (maxX - minX)) * 5;
            const normalizeY = (y: number) => ((y - minY) / (maxY - minY)) * 5;
            

            const nodeIdToIndex = new Map(nodeList.map((node, index) => [node.id, index]));
            
            let tikzCode = `\\begin{tikzpicture}[\n`;
            tikzCode += `    vertex/.style={circle, draw, fill=gray!20, minimum size=7mm},\n`;
            tikzCode += `    edge/.style={thick}\n`;
            tikzCode += `]\n`;
            tikzCode += `    % Vertices\n`;
            
            // Nodes
            nodeList.forEach((node, index) => {
                const x = normalizeX(node.x).toFixed(2);
                const y = normalizeY(node.y).toFixed(2);
                tikzCode += `    \\node[vertex] (v${index}) at (${x},${y}) {$v_{${index}}$};\n`;
            });
            
            tikzCode += `\n    % Edges with weights\n`;
            
            // Edges
            uniqueEdges.forEach(edge => {
                const sourceIndex = nodeIdToIndex.get(edge.sourceId);
                const targetIndex = nodeIdToIndex.get(edge.targetId);
                if (sourceIndex !== undefined && targetIndex !== undefined) {
                    if (isWeighted) {
                        tikzCode += `    \\draw[edge] (v${sourceIndex}) -- node[above] {${edge.weight}} (v${targetIndex});\n`;
                    } else {
                        tikzCode += `    \\draw[edge] (v${sourceIndex}) -- (v${targetIndex});\n`;
                    }
                }
            });
            
            tikzCode += `\\end{tikzpicture}`;
            
            // Download
            const blob = new Blob([tikzCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileSaveParams.filename || 'graph'}.tex`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }, [nodeActions, edgeActions, fileFormat, setErrorMessage, nodeList, fileSaveParams.filename]);
    
    const handleOpenGraph = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!data.nodes || !data.edges) {
                    alert('Invalid file format. Expected nodes and edges properties.');
                    return;
                }

                const isCompleteFormat = data.nodes.length > 0 && 
                    'x' in data.nodes[0] && 
                    'y' in data.nodes[0] && 
                    'style' in data.nodes[0];

                const dataForServer = {
                    nodes: data.nodes.map((node: NodeJson | GraphNode) => ({
                        id: node.id,
                        type: node.type,
                        demand: node.demand
                    })),
                    edges: data.edges.map((edge: EdgeJson | GraphEdge) => ({
                        id: edge.id,
                        sourceId: edge.sourceId,
                        targetId: edge.targetId,
                        weight: edge.weight
                    }))
                };
                
                const importedData = await graphAPI.importGraph(dataForServer);
                
                // Criar mapeamento de IDs antigos -> novos IDs do backend
                const oldToNewNodeId = new Map<number, number>();
                importedData.nodes.forEach((newNode: NodeJson, index: number) => {
                    const oldNode = data.nodes[index];
                    oldToNewNodeId.set(oldNode.id, newNode.id);
                });

                let loadedNodes: GraphNode[];
                let loadedEdges: GraphEdge[];
            
                if (isCompleteFormat) {
                    // Usar posições e estilos salvos, mas com IDs novos do backend
                    loadedNodes = data.nodes.map((node: GraphNode, index: number) => {
                        const newNodeId = importedData.nodes[index].id;
                        return {
                            id: newNodeId, // ID do backend
                            x: viewBox.x + node.x + DEFAULT_VIEWBOX_RIGHT_PADDING,
                            y: viewBox.y + node.y + DEFAULT_VIEWBOX_TOP_PADDING,
                            type: node.type as NodeType,
                            demand: node.demand,
                            style: node.style || NODE_STYLES.DEFAULT,
                            label: `${newNodeId}`,
                            clusterId: node.clusterId
                        };
                    });

                    // Atualizar sourceId e targetId das arestas com os novos IDs
                    loadedEdges = data.edges.map((edge: GraphEdge, index: number) => {
                        const newEdgeId = importedData.edges[index].id;
                        const newSourceId = oldToNewNodeId.get(edge.sourceId);
                        const newTargetId = oldToNewNodeId.get(edge.targetId);
                        
                        return {
                            id: newEdgeId, // ID do backend
                            sourceId: newSourceId!, // ID mapeado do backend
                            targetId: newTargetId!, // ID mapeado do backend
                            weight: edge.weight,
                            innerStyle: edge.innerStyle || INNER_EDGE_STYLES.DEFAULT,
                            outerStyle: edge.outerStyle || OUTER_EDGE_STYLES.DEFAULT
                        };
                    });
                } else {
                    // Grid positions
                    const numberOfNodes = importedData.nodes.length;
                    const positions = generateGridPositions(
                        numberOfNodes,
                        50,
                        { x: 100, y: 100 },
                        false,
                        0
                    );
                    
                    loadedNodes = importedData.nodes.map((node: NodeJson, index: number) => ({
                        id: node.id, // ID do backend
                        x: positions[index].x,
                        y: positions[index].y,
                        type: node.type as NodeType,
                        demand: node.demand,
                        style: NODE_STYLES.DEFAULT,
                        label: `${node.id}`
                    }));

                    // Atualizar sourceId e targetId das arestas com os IDs do backend
                    loadedEdges = importedData.edges.map((edge: EdgeJson) => ({
                        id: edge.id, // ID do backend
                        sourceId: edge.sourceId, // ID do backend
                        targetId: edge.targetId, // ID do backend
                        weight: edge.weight,
                        innerStyle: INNER_EDGE_STYLES.DEFAULT,
                        outerStyle: OUTER_EDGE_STYLES.DEFAULT
                    }));
                }

                setNodeList(loadedNodes);
                setEdgeList(loadedEdges);
                
                
            } catch (error) {
                console.error('Error loading file:', error);
                alert('Error loading file. Please check the file format.');
            }
        };
        
        input.click();
    }, [setEdgeList, setNodeList, viewBox.x, viewBox.y]);

    return (
        <>
            <select value={fileIOType} onChange={(e) => {
                setFileIOType(e.target.value.toUpperCase() as FileIOType)
            }}>
                <option value="SAVE">Save file</option>
                <option value="OPEN_FILE">Open file</option>
            </select>
      
            {fileIOType === FileIOTypes.SAVE && (
                <div className="params">
                    <label>Format: </label>
                    <select value={fileFormat} onChange={(e) => {
                        setFileFormat(e.target.value.toUpperCase() as FileFormat)
                    }}>
                        <option value="JSON">JSON</option>
                        <option value="JSON_COMPLETE">JSON Complete</option>
                        <option value="TIKZ">Tikz</option>
                    </select>

                    <label>Filename: </label>
                    <input 
                        type="text" 
                        value={fileSaveParams.filename}
                        onChange={(e) => setFileSaveParams({...fileSaveParams, filename:e.target.value})}
                        placeholder="graph"
                    />

                    <button onClick={handleSave}>Save</button>
                </div>
            )}

            {fileIOType === FileIOTypes.OPEN_FILE && (
                <div className="params">
                    OPen dialog
                    <button onClick={handleOpenGraph}>Open</button>
                </div>

                
            )}

  
            
        </>
    )
}