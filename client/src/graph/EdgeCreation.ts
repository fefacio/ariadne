
export class EdgeCreation {
    private state: EdgeCreationState;
    private svgRef: React.RefObject<SVGSVGElement | null>;
    private sourceNodeId: number | null = null;
    private sourceNodePosition: {x: number, y:number} | null = null;
    private targetNodeId: number | null = null;
    private targetNodePosition: {x: number, y:number} | null = null;
    private weight: number = 1;
    public onEdgeComplete: (node1Id: number, node2Id: number, weight: number) => Promise<void>;

    constructor(
        svgRef: React.RefObject<SVGSVGElement | null>, 
        onEdgeComplete: (node1Id: number, node2Id: number, weight?: number) => Promise<void>
    ) {
        this.state = new IdleState();
        this.state.setContext(this);
        this.svgRef = svgRef;
        this.onEdgeComplete = onEdgeComplete;
    }

    public transitionTo(state: EdgeCreationState): void {
        console.log(`Context: Transition to ${(state).constructor.name}.`);
        this.state = state;
        this.state.setContext(this);
    }

    public async clickCircle(node : SVGCircleElement, weight: number): Promise<void> {
        this.weight = weight;
        console.log("SET WEIGHT+ "+weight);
        await this.state.clickCircle(node);
    }

    public clickEmpty(){
        this.state.clickEmpty();
    }
    

    public cleanup(): void {
        this.sourceNodeId = null;
        this.sourceNodePosition = null;
        this.targetNodeId = null;
        this.targetNodePosition = null;
        this.weight = 1;
    }

    // Getters | Setters 
    getSourceNodeId() { return this.sourceNodeId; }
    setSourceNodeId(id: number) { this.sourceNodeId = id; }
  
    getSourceNodePosition() { return this.sourceNodePosition; }
    setSourceNodePosition(pos: {x: number, y: number}) { this.sourceNodePosition = pos; }

    getTargetNodeId() { return this.targetNodeId; }
    setTargetNodeId(id: number) { this.targetNodeId = id; }

    getTargetNodePosition() { return this.targetNodePosition; }
    setTargetNodePosition(pos: {x: number, y: number}) { this.targetNodePosition = pos; }

    getSvgRef() { return this.svgRef; }
    getState() { return this.state; }
    getWeight() { return this.weight }
}


abstract class EdgeCreationState {
    protected context!: EdgeCreation;

    public setContext(context: EdgeCreation) {
        this.context = context;
    }

    abstract clickCircle(node: SVGCircleElement): Promise<void>;
    abstract clickEmpty(): void;
}



export class IdleState extends EdgeCreationState {
    async clickCircle(node: SVGCircleElement): Promise<void> {
        const nodeId: number = Number(node.getAttribute("data-node-id"));
        console.log("ALL THE GOOD TIMES"+nodeId);
        const position = {
            x: node.cx.baseVal.value,
            y: node.cy.baseVal.value
        };

        this.context.setSourceNodeId(nodeId);
        this.context.setSourceNodePosition(position);
        this.context.transitionTo(new DrawingTempState());
    }

    clickEmpty(): void {
        
    }
}

export class DrawingTempState extends EdgeCreationState {
    async clickCircle(node: SVGCircleElement): Promise<void> {
        const nodeId: number = Number(node.getAttribute("data-node-id"));
        const position = {
            x: node.cx.baseVal.value,
            y: node.cy.baseVal.value
        };

        this.context.setTargetNodeId(nodeId);
        this.context.setTargetNodePosition(position);

        console.log("GGG1"+this.context.getSourceNodeId()!);
        console.log("GGG2"+this.context.getTargetNodeId()!);
        await this.context.onEdgeComplete(
            this.context.getSourceNodeId()!,
            this.context.getTargetNodeId()!,
            this.context.getWeight()
        )

        this.context.cleanup();
        this.context.transitionTo(new IdleState());
    }

    clickEmpty(): void {
        this.context.cleanup();
        this.context.transitionTo(new IdleState());

    }
}
