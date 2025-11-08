import { useState } from "react";
import { graphAPI, type PMedianRequest } from "../graphAPI";

const PMedianAlgorithms = {
    GREEDY: "GREEDY",
    INTERCHANGE: "INTERCHANGE",
    EXACT: "EXACT"
} as const;

type PMedianAlgorithm = typeof PMedianAlgorithms[keyof typeof PMedianAlgorithms]


export function PMedianMenu() {
    const [pMedianAlgorithm, setPMedianAlgorithm] = useState<PMedianAlgorithm>(PMedianAlgorithms.GREEDY);

    const [p, setP] = useState<number>(2);
    const [useDemand, setUseDemand] = useState<boolean>(false);

    // const sessionContext = useSession();
    // const uiStateContext = useUIState();
    
    
    const handlePMedian = async () => {
        const request: PMedianRequest = {
            algorithm: pMedianAlgorithm,
            p: p,
            useDemand: useDemand,
            useRandomInitialization: true
        };
        const response = graphAPI.pmedianGraph(request);
        console.log(response);
        
    };
    return (
        <>
            <label> Method: </label>
            <select value={pMedianAlgorithm} onChange={(e) => {
                setPMedianAlgorithm(e.target.value.toUpperCase() as PMedianAlgorithm)
            }}>
                <option value="GREEDY">Greedy (Kuehn & Hamburger, 1963)</option>
                <option value="INTERCHANGE">Interchange (Teitz & Bart, 1968) </option>
                <option value="EXACT"> Exact (OR-Tools)</option>
            </select>
                <div className="params-group">
                    <label htmlFor="p">Number of facilities (p):</label>
                    <input
                        id="p"
                        type="number"
                        min="1"
                        value={p}
                        onChange={(e) => setP(+e.target.value)}
                    />
                
                <label htmlFor="useDemand">Use custom demand? </label>
                <input
                    id="useDemand"
                    type="checkbox"
                    checked={useDemand}
                    onChange={(e) => setUseDemand(e.target.checked)}
                />
                <span className="full-width-text">
                    Default demand is 1.0 for all customers
                </span>
            </div>

            <button onClick={handlePMedian}>SEARCH</button>
        </>
       
    )
}