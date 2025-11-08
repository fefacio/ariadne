interface NodeRequest {
    label?: string;
    type?: string;
    demand?: number | null;
};

interface EdgeRequest {
    sourceId: number;
    targetId: number;
    weight?: number;
};

interface EdgeResponse {
    id: number;
    sourceId: number;
    targetId: number;
    weight: number;
};

interface HealthRequest {
    isServerUp: boolean;
};

interface GraphJsonData {
    nodes: {id: number, label: string, type: string, demand: number | null}[];
    edges: {id: number, source: number, target: number, weight: number}[];
};

interface ImportGraphResponse {
    message: string;
    nodes: Array<{
        id: number;
        label: string;
        type: string;
        demand: number | null;
    }>;
    edges: Array<{
        id: number;
        sourceId: number;
        targetId: number;
        weight: number;
    }>;
    nodeCount: number;
    edgeCount: number;
};

interface SearchRequest {
    method: string;
    sourceId: number;
    targetId: number;
};

export interface SearchResponse {
    method: string;
    sourceId: number;
    targetId: number;
    found: boolean;
    cost: number;
    path: Array<{
        id: number;
        label: string;
        type: string;
  }>;
};

interface ClusterRequest {
    k: number;
    maxIterations?: number;
    maxTrials?: number;
};

interface ClusterResponse {
    success: boolean;
    clusters: {[key: string]:  number};
    modularity: number;
    executionTimeMs: number;
    error?: string;
};


export interface PMedianRequest {
    algorithm: string;
    p: number;
    useDemand: boolean;
    useRandomInitialization: boolean;
};

export interface PMedianResposne {
    p: number;
    facilities: number[];
    cost: number;
    assignments: {[key: string]:  number};
    error: string;
};

interface GraphDataResponse {
    nodeCount: number;
    edgeCount: number
};



class GraphAPIClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        if (import.meta.env.VITE_API_BASE_URL==undefined){
            this.baseUrl = "http://localhost:8080/graph";
        } else {
            this.baseUrl = baseUrl ?? import.meta.env.VITE_API_BASE_URL+"/graph";
        }
    }

    private async request<T>(
        endpoint: string, 
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log("URL: "+ url);  

        try {
        const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return response.json();
        } else {
            return response.text() as T;
        }
        } catch (e) {
        console.log("FETCH ERROR: ", e);
        throw e;
        }
        
    }

    createNode = async (nodeData: NodeRequest): Promise<number> => {
        return this.request<number>('/node', {
        method: 'POST',
        body: JSON.stringify(nodeData),
        });
    };

    importGraph = async (jsonData: GraphJsonData): Promise<ImportGraphResponse> => {
        return this.request('/import/json', {
        method: 'POST',
        body: JSON.stringify(jsonData),
        });
    };

    searchGraph = async (searchRequest: SearchRequest): Promise<SearchResponse> => {
        return this.request('/algorithm/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest),
        });
    };

    pmedianGraph = async (pMedianRequest: PMedianRequest): Promise<PMedianResposne> => {
        return this.request('/algorithm/pmedian', {
        method: 'POST',
        body: JSON.stringify(pMedianRequest),
        });
    };

    clusterGraph = async (clusterRequest: ClusterRequest): Promise<ClusterResponse> => {
        return this.request('/algorithm/cluster', {
        method: 'POST',
        body: JSON.stringify(clusterRequest),
        });
    };

    updateNode = async (nodeId: number, nodeData: NodeRequest): Promise<number> => {
        return this.request<number>(`/node/${nodeId}`, {
        method: 'PUT',
        body: JSON.stringify(nodeData),
        });
    };

    deleteNode = async (nodeId: number): Promise<void> => {
        return this.request<void>(`/node/${nodeId}`, {
        method: 'DELETE',
        });
    };



    createEdge = async (edgeData: EdgeRequest): Promise<EdgeResponse[]> => {
        return this.request<EdgeResponse[]>('/edge', {
        method: 'POST',
        body: JSON.stringify(edgeData),
        });
    };

    updateEdge = async (edgeId: number, edgeData: EdgeRequest): Promise<number> => {
        return this.request<number>(`/edge/${edgeId}`, {
        method: 'PUT',
        body: JSON.stringify(edgeData),
        });
    };

    deleteEdge = async (edgeId: number): Promise<void> => {
        return this.request<void>(`/edge/${edgeId}`, {
        method: 'DELETE',
        });
    };

    clearGraph = async (): Promise<void> => {
        console.log("CLEARING!!!!!");
        return this.request<void>('/clear', {
        method: 'DELETE',
        });
    };

    createMultipleNodes = async (nodes: NodeRequest[]): Promise<number[]> => {
        const promises = nodes.map(node => this.createNode(node));
        return Promise.all(promises);
    };

    createMultipleEdges = async (edges: EdgeRequest[]): Promise<EdgeResponse[][]> => {
        const promises = edges.map(edge => this.createEdge(edge));
        return Promise.all(promises);
    };

    buildGraph = async (graphData: {
        nodes: NodeRequest[];
        edges: EdgeRequest[];
    }): Promise<{ nodes: number[]; edges: EdgeRequest[][] }> => {
        await this.clearGraph();
        
        const nodes = await this.createMultipleNodes(graphData.nodes);
        const edges = await this.createMultipleEdges(graphData.edges);
        
        return { nodes, edges };
    };

    getGraph = async (): Promise<GraphDataResponse> => {
        return this.request<GraphDataResponse>('/data', {
            method: 'GET',
        });
    }



    // [TODO?] MOVO THIS TO DIFFERENT API, AND IMPLEMENT ANOTHER CONTROLLER FOR HEALTH CHECK ONLY
    checkHealth = async (): Promise<HealthRequest | null> => {
        try {
        return await this.request<HealthRequest>(`/health`, {
            method: 'GET',
        });
        } catch (error) {
        console.error('Health check failed:', error);
        return null;
        }
    };
}

const graphAPI = new GraphAPIClient();

export { GraphAPIClient, graphAPI };
export type {
  NodeRequest,
  EdgeRequest,
  HealthRequest
};