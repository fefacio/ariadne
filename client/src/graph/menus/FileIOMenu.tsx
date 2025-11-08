import React, { useCallback, useState } from "react";
import "./Menus.css";
import type { GraphEdge, GraphNode } from "../SVGCanvas";
import { generateGridPositions } from "../generation/generationGrid";
import { type NodeType } from "../../types/types";
import { graphAPI } from "../graphAPI";
import { INNER_EDGE_STYLES, NODE_STYLES, OUTER_EDGE_STYLES } from "../../styles";
import type { EdgeActions } from "../useGraphEdges";

interface NodeJson {
    id: number;
    label: string;
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
    TIKZ: "TIKZ"
} as const;

type FileFormat = typeof FileFormats[keyof typeof FileFormats]

interface FileIoMenuProps {
    nodeList: GraphNode[];
    edgeActions: EdgeActions;
    setNodeList: React.Dispatch<React.SetStateAction<GraphNode[]>>;
    setEdgeList: React.Dispatch<React.SetStateAction<GraphEdge[]>>;
}

export function FileIOMenu({nodeList, edgeActions, setNodeList, setEdgeList}: FileIoMenuProps) {
    const [fileIOType, setFileIOType] = useState<FileIOType>(FileIOTypes.SAVE);
    const [fileFormat, setFileFormat] = useState<FileFormat>(FileFormats.JSON);
    const [fileSaveParams, setFileSaveParams] = useState({
        filename: "graph"
    });

    const handleSave = useCallback(() => {
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
        } else if (fileFormat === FileFormats.TIKZ) {
           
            const minX = Math.min(...nodeList.map(n => n.x));
            const maxX = Math.max(...nodeList.map(n => n.x));
            const minY = Math.min(...nodeList.map(n => n.y));
            const maxY = Math.max(...nodeList.map(n => n.y));
            // Normalization function
            const normalizeX = (x: number) => ((x - minX) / (maxX - minX)) * 5;
            const normalizeY = (y: number) => ((y - minY) / (maxY - minY)) * 5;
            
            // Criar mapeamento de ID para índice
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
    }, [edgeActions, nodeList, fileSaveParams.filename, fileFormat]);
    
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

                const importedData = await graphAPI.importGraph(data);
                
                // Grid Position default
                const numberOfNodes = importedData.nodes.length;
                const positions = generateGridPositions(
                    numberOfNodes,
                    50,
                    { x: 100, y: 100 },
                    false,
                    0
                );
                console.log("HAHAHA");
                console.log(importedData.nodes);
                
                const loadedNodes: GraphNode[] = importedData.nodes.map((node: NodeJson, index: number) => ({
                    id: node.id,
                    x: positions[index].x,
                    y: positions[index].y,
                    type: node.type as NodeType,
                    demand: node.demand,
                    style: NODE_STYLES.DEFAULT
                }));
                const loadedEdges: GraphEdge[] = importedData.edges.map((edge: EdgeJson) => ({
                    id: edge.id, // ID do backend
                    sourceId: edge.sourceId,
                    targetId: edge.targetId,
                    weight: edge.weight,
                    innerStyle: INNER_EDGE_STYLES.DEFAULT,
                    outerStyle: OUTER_EDGE_STYLES.DEFAULT
                }));

                setNodeList(loadedNodes);
                setEdgeList(loadedEdges);
                
                
            } catch (error) {
                console.error('Error loading file:', error);
                alert('Error loading file. Please check the file format.');
            }
        };
        
        input.click();
    }, [setEdgeList, setNodeList]);

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