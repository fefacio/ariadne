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
                        const newWeight = +e.target.value <= 0 ? 1 : +e.target.value
                        setEdgeParams({ ...edgeParams, weight: newWeight });
                        edgeActions.updateWeight(edgeId, newWeight);
                    }}
                />
            
            </div>
        </div >
    )
}