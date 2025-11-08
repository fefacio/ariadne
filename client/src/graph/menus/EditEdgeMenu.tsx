import { useState } from "react";
import type { EdgeActions } from "../useGraphEdges";

interface EdgeParams {
    edgeId: number;
    weight: number;
};

interface EditEdgeMenuProps {
    edgeId: number;
    edgeActions: EdgeActions
}
export function EditEdgeMenu({edgeId, edgeActions}: EditEdgeMenuProps) {
    //const edge = edgeActions.getById(edgeId);
    
    const [edgeParams, setEdgeParams] = useState<EdgeParams>({
        edgeId: edgeId,
        weight: 1.0
    });

    return (
        <div>
            <p> Edge {edgeId} </p>
            <div className="params">
                <label htmlFor="edgeWeight">Weight: </label>
                <input
                    id="edgeWeight"
                    type="number"
                    min="1"
                    value={edgeParams.weight} 
                    onChange={(e) => {
                        setEdgeParams({ ...edgeParams, weight: +e.target.value });
                        edgeActions.updateWeight(edgeId, +e.target.value);
                    }}
                />
            
            </div>
        </div >
    )
}