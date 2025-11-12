import { useState } from "react";
import { graphAPI } from "../graphAPI";
import { statsAPI }  from "../statsAPI";
import type { NodeActions } from "../useGraphNodes";
import { NodeTypes } from "../../types";
import { FillingTypes } from "../generation/generationUtils";
import { GridTypes } from "../generation/generationGrid";
import { generateGrid } from "../generation/generationGrid";
import { generateRing } from "../generation/generationRing";
import type { EdgeActions } from "../useGraphEdges";

interface ReportMenuProps {
    nodeActions: NodeActions;
    edgeActions: EdgeActions;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

interface ReportData {
    graphType: string;
    numberOfNodes: number;
    numberOfEdges: number;
    numberOfConsumers: number;
    numberOfCandidates: number;
    avgDemand: number;
    minDegree: number;
    maxDegree: number;
    avgDegree: number;
    minStrength: number;
    maxStrength: number;
    avgStrength: number;
    density: number;
    radius: number;
    diameter: number;
    avgClusteringCoefficient: number;
    avgPathLength: number;
    avgDegreeCentrality: number;
    avgStrengthCentrality: number;
    avgClosenessCentrality: number;
    avgBetweennessCentrality: number;
    p: number;
    greedyCost: number;
    interchangeCost: number;
}

export function ReportMenu({ nodeActions, edgeActions, setErrorMessage }: ReportMenuProps) {
    const [numberOfGraphs, setNumberOfGraphs] = useState<number>(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<string>("");

    const [nodeFrom, setNodeFrom] = useState<number>(10);
    const [nodeTo, setNodeTo] = useState<number>(20);
    const [edgeProbability, setEdgeProbability] = useState<number>(0.5);
    const [maxAttempts, setMaxAttempts] = useState<number>(1000);

    const randomInt = (min: number, max: number) => 
        Math.floor(Math.random() * (max - min + 1)) + min;

    const randomFloat = (min: number, max: number) => 
        Math.random() * (max - min) + min;

    const randomChoice = <T,>(arr: T[]): T => 
        arr[Math.floor(Math.random() * arr.length)];

    const clearGraph = async () => {
        nodeActions.setNodes([]);
        edgeActions.setEdges([]);
        await graphAPI.clearGraph();
    
    };

    const generateRandomGraph = async (): Promise<string> => {
        const graphTypes = ['GRID', 'SMALL_WORLD', 'SCALE_FREE'];
        const graphType = randomChoice(graphTypes);

        const nodeCount = randomInt(nodeFrom, nodeTo);
        const spacing = randomInt(30, 80);
        const initialPosition = { x: 50, y: 50 };

        let graph;

        if (graphType === 'GRID') {
            const gridSize = Math.ceil(Math.sqrt(nodeCount));
            graph = generateGrid({
                gridType: GridTypes.SQUARE,
                gridSize: gridSize,
                spacing: spacing,
                useNoise: Math.random() > 0.5,
                noisePercentage: randomInt(20, 80),
                fillingType: FillingTypes.NEIGHBORS_VH,
                numberOfNodes: nodeCount,
                initialPosition: initialPosition,
                edgeProbability: edgeProbability,
                maxAttempts: maxAttempts
            });
        } else if (graphType === 'SMALL_WORLD') {
            const k = randomInt(2, Math.min(10, Math.floor((nodeCount - 2) / 2))) * 2;
            graph = generateRing({
                spacing: spacing,
                useNoise: false,
                noisePercentage: 0,
                fillingType: FillingTypes.SMALL_WORLD,
                numberOfNodes: nodeCount,
                initialPosition: initialPosition,
                k: k,
                probability: randomFloat(0.05, 0.3),
                edgeProbability: edgeProbability,
                maxAttempts: maxAttempts
            });
        } else { // SCALE_FREE
            const m0 = randomInt(3, Math.min(10, nodeCount - 1));
            const m = randomInt(2, m0);
            graph = generateRing({
                spacing: spacing,
                useNoise: false,
                noisePercentage: 0,
                fillingType: FillingTypes.SCALE_FREE,
                numberOfNodes: nodeCount,
                initialPosition: initialPosition,
                m: m,
                m0: m0,
                edgeProbability: edgeProbability,
                maxAttempts: maxAttempts

            });
        }

        const { nodes, edges } = graph;

        const idMap = new Map<number, number>();
        for (const node of nodes) {
            const oldId = node.id;
            const newId = await nodeActions.add(node.x, node.y, node.type, null);
            node.id = newId;
            idMap.set(oldId, newId);
        }

        for (const edge of edges) {
            const newSourceId = idMap.get(edge.sourceId)!;
            const newTargetId = idMap.get(edge.targetId)!;
            await edgeActions.add(newSourceId, newTargetId, randomInt(1,10));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        return graphType;
    };

    const randomizeConsumersAndDemands = async () => {
        const nodes = nodeActions.getNodes();
        const numConsumers = randomInt(Math.ceil(nodes.length * 0.2), Math.floor(nodes.length * 0.5));
        
        const shuffled = [...nodes].sort(() => Math.random() - 0.5);
        const selectedConsumerIds = new Set(shuffled.slice(0, numConsumers).map(n => n.id));

        for (const node of nodes) {
            const isConsumer = selectedConsumerIds.has(node.id);
            const newType = isConsumer ? NodeTypes.CONSUMER : NodeTypes.NORMAL;
            await nodeActions.updateType(node.id, newType);
        }

        for (const nodeId of selectedConsumerIds) {
            const demand = randomInt(1, 10);
            await nodeActions.updateDemand(nodeId, demand);
        }
        
        console.log(`Randomized ${numConsumers} consumers out of ${nodes.length} nodes`);
    };

    const runPMedian = async (p: number): Promise<{ greedyCost: number, interchangeCost: number }> => {
        const greedy = await graphAPI.pmedianGraph({
            algorithm: 'GREEDY',
            p: p,
            useDemand: true,
            useRandomInitialization: false
        });

        if (greedy.error) {
            throw new Error(`Greedy error: ${greedy.error}`);
        }

        const interchange = await graphAPI.pmedianGraph({
            algorithm: 'INTERCHANGE',
            p: p,
            useDemand: true,
            useRandomInitialization: true
        });

        if (interchange.error) {
            throw new Error(`Interchange error: ${interchange.error}`);
        }

        return {
            greedyCost: greedy.cost,
            interchangeCost: interchange.cost
        };
    };

    const generateReport = async () => {
        setIsGenerating(true);
        const reportData: ReportData[] = [];

        try {
            for (let i = 0; i < numberOfGraphs; i++) {
                setProgress(`Generating graph ${i + 1}/${numberOfGraphs}...`);

                await clearGraph();
                
                const graphType = await generateRandomGraph();
                
                await randomizeConsumersAndDemands();
                
                const nodes = nodeActions.getNodes();
                const consumers = nodes.filter(n => n.type === NodeTypes.CONSUMER);
                const nonConsumers = nodes.filter(n => n.type !== NodeTypes.CONSUMER);
                
                const graphStats = await statsAPI.getGraphStats();

                const maxP = Math.min(consumers.length, nonConsumers.length);
                if (maxP < 1) {
                    console.warn(`Graph ${i + 1} has no valid p value (maxP=${maxP}), skipping...`);
                    continue;
                }
                const p = randomInt(1, Math.min(maxP, 10));
                const { greedyCost, interchangeCost } = await runPMedian(p);

                reportData.push({
                    graphType: graphType,
                    numberOfNodes: graphStats.numberOfNodes,
                    numberOfEdges: graphStats.numberOfEdges,
                    numberOfConsumers: graphStats.numberOfConsumers,
                    numberOfCandidates: graphStats.numberOfCandidates,
                    avgDemand: graphStats.avgDemand,
                    minDegree: graphStats.minDegree,
                    maxDegree: graphStats.maxDegree,
                    avgDegree: graphStats.avgDegree,
                    minStrength: graphStats.minStrength,
                    maxStrength: graphStats.maxStrength,
                    avgStrength: graphStats.avgStrength,
                    density: graphStats.density,
                    radius: graphStats.radius,
                    diameter: graphStats.diamater,
                    avgClusteringCoefficient: graphStats.avgClusteringCoefficient,
                    avgPathLength: graphStats.avgPathLength,
                    avgDegreeCentrality: graphStats.avgDegreeCentrality,
                    avgStrengthCentrality: graphStats.avgStrengthCentrality,
                    avgClosenessCentrality: graphStats.avgClosenessCentrality,
                    avgBetweennessCentrality: graphStats.avgBetweennessCentrality,
                    p: p,
                    greedyCost: greedyCost,
                    interchangeCost: interchangeCost
                });

            }

            if (reportData.length === 0) {
                throw new Error('No valid graphs were generated');
            }

            downloadCSV(reportData);
            setProgress(`Report generated successfully! ${reportData.length} graphs processed.`);
            
        } catch (error) {
            console.error('Report generation failed:', error);
            setErrorMessage(`Failed to generate report: ${error}`);
            setProgress("Failed to generate report");
        } finally {
            setIsGenerating(false);
            await clearGraph();
        }
    };

    const downloadCSV = (data: ReportData[]) => {
        const headers = [
            'graphType', 'numberOfNodes', 'numberOfEdges', 'numberOfConsumers', 'numberOfCandidates',
            'avgDemand', 'minDegree', 'maxDegree', 'avgDegree', 'minStrength', 'maxStrength',
            'avgStrength', 'density', 'radius', 'diameter', 'avgClusteringCoefficient',
            'avgPathLength', 'avgDegreeCentrality', 'avgStrengthCentrality',
            'avgClosenessCentrality', 'avgBetweennessCentrality', 'p', 'greedyCost', 'interchangeCost'
        ];

        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header as keyof ReportData];
                    return typeof value === 'number' ? value.toFixed(4) : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pmedian_report_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="params">
            <div className="params-group">
                <label htmlFor="numberOfGraphs">Number of graphs:</label>
                <input
                    id="numberOfGraphs"
                    type="number"
                    min="1"
                    max="1000"
                    value={numberOfGraphs}
                    onChange={(e) => setNumberOfGraphs(+e.target.value)}
                    disabled={isGenerating}
                />
            </div>

            <button 
                onClick={generateReport}
                disabled={isGenerating}
                style={{ marginTop: '1rem' }}
            >
                {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>

            {progress && (
                <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                    {progress}
                </div>
            )}
            <div className="params-group">
                <label htmlFor="demandFrom">Node From:</label>
                <input
                    id="demandFrom"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={nodeFrom}
                    onChange={(e) => {
                        const value = +e.target.value <= 0 ? 1 : +e.target.value;
                        if (value>=nodeTo){
                            setNodeTo(nodeFrom+2);
                        }
                        setNodeFrom(value);
                    }}
                />

                <label htmlFor="demandTo">Node To:</label>
                <input
                    id="demandTo"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={nodeTo}
                    onChange={(e) => {
                        const value = +e.target.value <= nodeFrom ? nodeFrom+1 : +e.target.value;
                        setNodeTo(value);
                    }}
                />

                <label htmlFor="edgeProb">Edge Probability:</label>
                <input
                    id="edgeProb"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={edgeProbability}
                    onChange={(e) => setEdgeProbability(+e.target.value)}
                />
                <span className="full-width-text">
                    {(edgeProbability * 100).toFixed(0)}% chance for each possible edge
                </span>

                <label htmlFor="maxAttempts">Max Attempts:</label>
                <input
                    id="maxAttempts"
                    type="number"
                    min="10"
                    max="1000"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(+e.target.value)}
                />
            </div>
            

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <p>This will generate random graphs with:</p>
                <ul style={{ marginLeft: '1rem' }}>
                    <li>Graph types: Grid, Small World, Scale Free</li>
                    <li>Edge probability {edgeProbability}</li>
                    <li>Max attempt {maxAttempts}</li>
                    <li>Random node count {`${nodeFrom}-${nodeTo}`}</li>
                    <li>Random consumers (20-50%)</li>
                    <li>Random demands (1-10)</li>
                    <li>Random p value (1-10)</li>
                </ul>
            </div>
        </div>
    );
}