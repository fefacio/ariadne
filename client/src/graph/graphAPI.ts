interface NodeRequest {
  label?: string;
  type?: string;
};

interface EdgeRequest {
  sourceId: number;
  targetId: number;
  weight?: number;
};

interface HealthRequest {
  isServerUp: boolean;
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
      console.log("RESPONSE>ok"+response.ok);
      console.log("RESPONSE>status"+response.status);
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

  createMultipleNodes = async (nodes: NodeRequest[]): Promise<number[]> => {
    const promises = nodes.map(node => this.createNode(node));
    return Promise.all(promises);
  };

  createMultipleEdges = async (edges: EdgeRequest[]): Promise<number[]> => {
    const promises = edges.map(edge => this.createEdge(edge));
    return Promise.all(promises);
  };

  buildGraph = async (graphData: {
    nodes: NodeRequest[];
    edges: EdgeRequest[];
  }): Promise<{ nodes: number[]; edges: number[] }> => {
    await this.clearGraph();
    
    const nodes = await this.createMultipleNodes(graphData.nodes);
    const edges = await this.createMultipleEdges(graphData.edges);
    
    return { nodes, edges };
  };

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