import React, { useCallback } from "react";
import { Modes, NodeTypes, type Mode, type NodeType } from "../types/types"

export interface AddNodeParams {
    nodeType: NodeType;
    demand: number | null;
};

export interface AddEdgeParams {
    weight: number;
};


interface AddNodeFormProps {
    currentMode: Mode,
    addNodeParams: AddNodeParams;
    setAddNodeParams: React.Dispatch<React.SetStateAction<AddNodeParams>>;
    addEdgeParams: AddEdgeParams;
    setAddEdgeParams: React.Dispatch<React.SetStateAction<AddEdgeParams>>;
}

export function AddParameters({currentMode, addNodeParams, setAddNodeParams, addEdgeParams, setAddEdgeParams}: AddNodeFormProps) {
    const handleNodeTypeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const nodeType = event.target.value as NodeType;
        
        setAddNodeParams(prev => ({
            ...prev,
            nodeType: nodeType,
            demand: nodeType === NodeTypes.CONSUMER 
                ? (prev.nodeType === NodeTypes.CONSUMER ? prev.demand : 1)
                : null
        }));
    }, [setAddNodeParams]);

    const handleDemandChange = useCallback((value: number) => {
        setAddNodeParams(prev => ({
            ...prev,
            demand: value
        }));
    }, [setAddNodeParams]);

    const handleWeightChange = useCallback((value: number) => {
        setAddEdgeParams(prev => ({
            ...prev,
            weight: value
        }));
    }, [setAddEdgeParams]);

    return (
        <div className="add-params">
            {currentMode===Modes.ADD_NODE && (
                <div>
                    <span>Node parameters: </span>
                    <form className="add-node-form">
                        <p>Node Type</p>
                        <label> 
                            <input
                                type="radio"
                                name="nodeType"
                                value="NORMAL"
                                checked={addNodeParams.nodeType===NodeTypes.NORMAL}
                                onChange={handleNodeTypeChange}
                            /> Normal
                        </label>
                        <label> 
                            <input
                                type="radio"
                                name="nodeType"
                                value="CONSUMER"
                                checked={addNodeParams.nodeType===NodeTypes.CONSUMER}
                                onChange={handleNodeTypeChange}
                            /> Consumer
                        </label>
                        <label> 
                            <input
                                type="radio"
                                name="nodeType"
                                value="FACILITY"
                                checked={addNodeParams.nodeType===NodeTypes.FACILITY}
                                onChange={handleNodeTypeChange}
                            /> Facility
                        </label>
                    </form>
                    {addNodeParams.nodeType===NodeTypes.CONSUMER && (
                        <div>
                            <label htmlFor="demand">Demand: </label>
                            <input
                                id="demand"
                                type="number"
                                min="1"
                                step="1"
                                value={addNodeParams.demand ?? 1.0}
                                onChange={(e) => handleDemandChange(+e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}
            {currentMode===Modes.ADD_EDGE && (
                <div>
                    <span>Edge parameters: </span> <br/>
                    <label htmlFor="weight">Weight: </label>
                    <input
                        id="weight"
                        type="number"
                        min="1"
                        step="1"
                        value={addEdgeParams.weight}
                        onChange={(e) => handleWeightChange(+e.target.value)}
                    />
                </div>

                
            )}
            
        </div>
        
    )
}