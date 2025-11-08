export interface GraphStatsResponse {
    nodeCount: number;
    edgeCount: number;
}

export interface NodeStatsResponse {
    id: number;
    label: string;
    type: string;
    degree: number;
    normalizedDegree: number;
    neighborIds: number[];
    betweennessCentrality: number;
    closenessCentrality: number;
    averagePathLength: number;
    clusteringCoefficient: number;
    eccentricity: number;
}

class StatsAPIClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        if (import.meta.env.VITE_API_BASE_URL == undefined) {
            this.baseUrl = "http://localhost:8080/stats";
        } else {
            this.baseUrl = baseUrl ?? import.meta.env.VITE_API_BASE_URL + "/stats";
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        returnBlob: boolean = false
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log("URL: " + url);

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

            if (returnBlob) {
                return response.blob() as T;
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

    getGraphStats = async (): Promise<GraphStatsResponse> => {
        return this.request<GraphStatsResponse>('/graph', {
            method: 'GET',
        });
    }

    getNodeStats = async (nodeId: number): Promise<NodeStatsResponse> => {
        return this.request<NodeStatsResponse>(`/node/${nodeId}`, {
            method: 'GET',
        });
    }

    getNodesReport = async (): Promise<Blob> => {
        return this.request<Blob>(`/node/report`, {
            method: 'GET'
        }, true); 
    }
}

const statsAPI = new StatsAPIClient();

export { StatsAPIClient, statsAPI };