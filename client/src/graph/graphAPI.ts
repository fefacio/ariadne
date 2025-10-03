interface NodeRequest {
  label?: string;
  type?: string;
}

interface EdgeRequest {
  sourceId: number;
  targetId: number;
  weight?: number;
}


class GraphAPIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? import.meta.env.VITE_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log("URL: "+ url);  
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
  }

  createNode = async (nodeData: NodeRequest): Promise<number> => {
    return this.request<number>('/node', {
      method: 'POST',
      body: JSON.stringify(nodeData),
    });
  };

  deleteNode = async (nodeId: number): Promise<void> => {
    return this.request<void>(`/node/${nodeId}`, {
      method: 'DELETE',
    });
  };

  createEdge = async (edgeData: EdgeRequest): Promise<number> => {
    return this.request<number>('/edge', {
      method: 'POST',
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

  // Batch operations
  createMultipleNodes = async (nodes: NodeRequest[]): Promise<number[]> => {
    const promises = nodes.map(node => this.createNode(node));
    return Promise.all(promises);
  };

  createMultipleEdges = async (edges: EdgeRequest[]): Promise<number[]> => {
    const promises = edges.map(edge => this.createEdge(edge));
    return Promise.all(promises);
  };

  // Graph building helper
  buildGraph = async (graphData: {
    nodes: NodeRequest[];
    edges: EdgeRequest[];
  }): Promise<{ nodes: number[]; edges: number[] }> => {
    // Clear existing graph
    await this.clearGraph();
    
    // Create nodes first
    const nodes = await this.createMultipleNodes(graphData.nodes);
    
    // Then create edges
    const edges = await this.createMultipleEdges(graphData.edges);
    
    return { nodes, edges };
  };
}

const graphAPI = new GraphAPIClient();

export { GraphAPIClient, graphAPI };
export type {
  NodeRequest,
  EdgeRequest,
};