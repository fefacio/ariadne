package com.fefacio.demo.service;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.DoubleStream;

import org.springframework.stereotype.Service;

import com.fefacio.demo.algorithm.GraphClustering;
import com.fefacio.demo.algorithm.GraphSearch;
import com.fefacio.demo.algorithm.pmedian.PMedianGreedy;
import com.fefacio.demo.algorithm.pmedian.PMedianInterchange;
import com.fefacio.demo.algorithm.pmedian.PMedianORTools;
import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.graph.NodeType;
import com.fefacio.demo.model.request.ClusteringRequest;
import com.fefacio.demo.model.request.EdgeRequest;
import com.fefacio.demo.model.request.NodeRequest;
import com.fefacio.demo.model.response.ClusteringResponse;
import com.fefacio.demo.model.response.EdgeResponse;
import com.fefacio.demo.model.response.GraphDataResponse;
import com.fefacio.demo.model.response.NodeResponse;
import com.fefacio.demo.model.response.PMedianResponse;
import com.fefacio.demo.model.response.SearchResponse;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

@Service
public class GraphService {
    private Graph graph = new Graph();
    private GraphSearch search = new GraphSearch(graph);
    private final Gson gson = new Gson();
    
    public Node getNode(Integer nodeId){
        return graph.getNodeById(nodeId);
    }

    public Integer addNode(NodeRequest nodeRequest){
        Node node = new Node();
        NodeType nodeType = NodeType.NORMAL;
        if (nodeRequest.getType() != null) {
            try {
                nodeType = NodeType.valueOf(nodeRequest.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid NodeType"+e);
            }
        }
        node.setType(nodeType);
        if (nodeRequest.getLabel()!=null){
            node.setLabel(nodeRequest.getLabel());
        }
        if (nodeRequest.getDemand()!=null){
            if (nodeType==NodeType.CONSUMER){
                node.setDemand(nodeRequest.getDemand());
            } else {
                node.setDemand(null);
            }
        }

        graph.addNode(node);
        return node.getId();
    }

    public Node updateNode(Integer nodeId, NodeRequest nodeRequest){
        StringBuilder sb = new StringBuilder("Update node: Old ");
        Node node = graph.getNodeById(nodeId);
        sb.append(node.toString());
        if (nodeRequest.getType()!=null){
            node.setType(NodeType.valueOf(nodeRequest.getType().toUpperCase()));
        }
        sb.append("| New ");
        sb.append(node.toString());
        System.out.println(sb.toString());
        return node;
    }

    public boolean removeNode(Integer nodeId){
        return graph.removeNodeById(nodeId);
    }

    public Edge getEdge(Integer edgeId){
        return graph.getEdgeById(edgeId);
    }

    public synchronized List<Edge> addEdge(EdgeRequest edgeRequest){
        System.out.println("[addEdge] Current edge count: " + graph.getEdgeCount());
        Integer node1Id = edgeRequest.getSourceId();
        Node node1 = graph.getNodeById(node1Id);

        Integer node2Id = edgeRequest.getTargetId();
        Node node2 = graph.getNodeById(node2Id);

        Double weight = edgeRequest.getWeight();
        if (weight==null){
            weight = 1.0;
        }
        Edge forwardEdge = new Edge(node1, node2, weight);
        Edge backwardEdge = new Edge(node2, node1, weight);
        graph.addEdge(forwardEdge);
        graph.addEdge(backwardEdge);
        System.out.println("[addEdge] New edge count: " + graph.getEdgeCount());

        return new ArrayList<Edge>(List.of(forwardEdge, backwardEdge));
    }

    public Edge updateEdge(Integer edgeId, EdgeRequest edgeRequest){
        StringBuilder sb = new StringBuilder("Update edge: Old ");
        Edge edge = graph.getEdgeById(edgeId);
        sb.append(edge.toString());
        Double weight = edgeRequest.getWeight();
        if (weight!=null){
            edge.setWeight(weight);
            graph.getReverseEdge(edge).setWeight(weight);
        }
        sb.append("| New ");
        sb.append(edge.toString());
        System.out.println(sb.toString());
        return edge;
    }

    public boolean removeEdge(Integer edgeId){
        System.out.println("[removeEdge] Attempting to remove edge ID: " + edgeId);
        System.out.println("[removeEdge] Current edge count: " + graph.getEdgeCount());
        boolean result = graph.removeEdgeById(edgeId);
        System.out.println("[removeEdge] Result: " + result);
        System.out.println("[removeEdge] New edge count: " + graph.getEdgeCount());

        return result;
    }

    public GraphDataResponse getGraphData(){
        return new GraphDataResponse(
            graph.getNodeCount(),
            graph.getEdgeCount()
        );
    }

    /**
     * Exporta o grafo atual para JSON
     * @param filePath caminho do arquivo (se null, retorna apenas String)
     * @return JSON string do grafo
     */
    public String exportGraphJson(String filePath) {
        GraphJson graphJson = new GraphJson();
        
        for (Node node : graph.getNodes()) {
            NodeJson nodeJson = new NodeJson();
            nodeJson.id = node.getId();
            nodeJson.label = node.getLabel();
            nodeJson.type = node.getType().name();
            nodeJson.demand = node.getDemand();
            graphJson.nodes.add(nodeJson);
        }
        
        Set<Integer> addedEdges = new HashSet<>();
        for (Edge edge : graph.getEdges()) {
            if (!addedEdges.contains(edge.getId())) {
                EdgeJson edgeJson = new EdgeJson();
                edgeJson.id = edge.getId();
                edgeJson.sourceId = edge.getSource().getId();
                edgeJson.targetId = edge.getTarget().getId();
                edgeJson.weight = edge.getWeight();
                graphJson.edges.add(edgeJson);
                addedEdges.add(edge.getId());
            }
        }
        
        String jsonString = gson.toJson(graphJson);
        
        if (filePath != null && !filePath.isEmpty()) {
            try (FileWriter writer = new FileWriter(filePath)) {
                writer.write(jsonString);
                System.out.println("Graph exported to: " + filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to write file: " + e.getMessage(), e);
            }
        }
        
        return jsonString;
    }
    
    /**
     * Exporta o grafo para JSON string
     */
    public String exportGraphJson() {
        return exportGraphJson(null);
    }

    /**
     * Importa um grafo de JSON
     * @param jsonString JSON string contendo o grafo
     * @param clearExisting se true, limpa o grafo atual antes de importar
     */
    public void importGraphJson(String jsonString, boolean clearExisting) {
        try {
            GraphJson graphJson = gson.fromJson(jsonString, GraphJson.class);
            
            if (graphJson == null || graphJson.nodes == null) {
                throw new IllegalArgumentException("Invalid JSON format: missing nodes");
            }
            if (clearExisting) {
                graph.clear();
            }

            Map<Integer, Integer> jsonIdToNodeIdMap = new HashMap<>();
            
            // --------- IMPORT NODES
            for (NodeJson nodeJson : graphJson.nodes) {    
                Integer nodeId = this.addNode(new NodeRequest(nodeJson.label, nodeJson.type, nodeJson.demand));
                jsonIdToNodeIdMap.put(nodeJson.id, nodeId);
            }
            
            // --------- IMPORT EDGES 
            if (graphJson.edges != null) {
                for (EdgeJson edgeJson : graphJson.edges) {
                    Integer sourceNodeId = jsonIdToNodeIdMap.get(edgeJson.sourceId);
                    Integer targetNodeId = jsonIdToNodeIdMap.get(edgeJson.targetId);
                    
                    if (sourceNodeId == null) {
                        throw new IllegalArgumentException(
                            "Invalid edge: source node not found (id: " + edgeJson.sourceId + ")"
                        );
                    }
                    if (targetNodeId == null) {
                        throw new IllegalArgumentException(
                            "Invalid edge: target node not found (id: " + edgeJson.targetId + ")"
                        );
                    }
                    
                    Double weight = edgeJson.weight != null ? edgeJson.weight : 1.0;
                    this.addEdge(new EdgeRequest(sourceNodeId, targetNodeId, weight));
                }
            }
            
            System.out.println("Graph imported successfully: " + 
                             graphJson.nodes.size() + " nodes, " + 
                             (graphJson.edges != null ? graphJson.edges.size() : 0) + " edges");
                             
        } catch (JsonSyntaxException e) {
            throw new IllegalArgumentException("Invalid JSON syntax: " + e.getMessage(), e);
        }
    }
    
    public void importGraphJson(String jsonString) {
        importGraphJson(jsonString, true);
    }
    
    public void clearGraph(){
        graph.clear();
        graph.getAdjacencyList().clear();
    }
    
    public Graph getGraph() {
        return graph;
    }

    public List<NodeResponse> getAllNodes() {
        List<NodeResponse> nodeResponses = new ArrayList<>();
        for (Node node : graph.getNodes()) {
            NodeResponse response = new NodeResponse();
            response.setId(node.getId());
            response.setLabel(node.getLabel());
            response.setType(node.getType().name());
            response.setDemand(node.getDemand());
            nodeResponses.add(response);
        }
        return nodeResponses;
    }

    public List<EdgeResponse> getAllEdges() {
        List<EdgeResponse> edgeResponses = new ArrayList<>();
        for (Edge edge : graph.getEdges()) {
            EdgeResponse response = new EdgeResponse(
                edge.getId(),
                edge.getSource().getId(),
                edge.getTarget().getId(),
                edge.getWeight()
            );
            edgeResponses.add(response);
        }
        return edgeResponses;
    }

    public SearchResponse graphSearch(String method, Integer sourceId, Integer targetId){
        Node source = graph.getNodeById(sourceId);
        Node target = graph.getNodeById(targetId);
        SearchResponse result = new SearchResponse(method, sourceId, targetId);
        switch (method){
            case "BFS":
                result = search.searchBFS(source, target);
                break;
            case "DFS":
                result = search.searchDFS(source, target);
                break;
            case "GREEDY":
                result = search.searchGreedy(source, target);
                break;
            case "DIJKSTRA":
                result = search.searchDijkstra(source, target);
            
        } 

        return result;
    }

    public PMedianResponse graphPMedian(String algorithm, Integer p, boolean useDemand, boolean useRandomInitialized){
    double[][] cost = graph.getCostMatrix().getData();
    double[] weights;
    if (useDemand){
        weights = graph.getNodeDemands().stream().mapToDouble(Double::doubleValue).toArray();
    } else {
        weights = DoubleStream.generate(() -> 1.0).limit(graph.getNodeCount()).toArray();
    }
    
    PMedianResponse pMedianResponse = new PMedianResponse(p);
    
    switch (algorithm){
        case "GREEDY":
            PMedianGreedy greedy = new PMedianGreedy(cost, weights, p);
            greedy.solve(); 
            pMedianResponse.setFacilities(greedy.getSolution()); 
            pMedianResponse.setCost(greedy.getSolutionCost()); 
            pMedianResponse.setAssignments(greedy.getAssignments());
            break;
            
        case "INTERCHANGE":
            PMedianInterchange interchange = new PMedianInterchange(cost, weights, p, useRandomInitialized);
            interchange.solve(); 
            pMedianResponse.setFacilities(interchange.getSolution()); 
            pMedianResponse.setCost(interchange.getSolutionCost());
            pMedianResponse.setAssignments(interchange.getAssignments());
            break;
            
        case "EXACT":
            PMedianORTools exact = new PMedianORTools(cost, weights, p);
            exact.solve();
            pMedianResponse.setFacilities(exact.getSolution());
            pMedianResponse.setCost(exact.getSolutionCost());
            pMedianResponse.setAssignments(exact.getAssignments());
            break;
            
        default:
            throw new IllegalArgumentException("Unknown algorithm: " + algorithm);
    }

    return pMedianResponse;
}

    public ClusteringResponse graphCluster(ClusteringRequest clusteringRequest) {
        GraphClustering clustering = new GraphClustering(graph);
        ClusteringResponse result = new ClusteringResponse();
        if (graph.getNodeCount()==0){
            return new ClusteringResponse("A graph doesnt exist");
        }
        
        try {
            Integer k = clusteringRequest.getK();
            Integer maxIterations = clusteringRequest.getMaxIterations();
            Integer maxTrials = clusteringRequest.getMaxTrials();
            
            if (maxIterations == null) maxIterations = 1000;
            if (maxTrials == null) maxTrials = 10;
            
            long startTime = System.currentTimeMillis();
            Map<Integer, Integer> clusters = clustering.spectralClustering(k, maxIterations, maxTrials);
            long executionTime = System.currentTimeMillis() - startTime;
            double modularity = clustering.calculateModularity(clusters);
            
            result.setSuccess(true);
            result.setClusters(clusters);
            result.setModularity(modularity);
            result.setExecutionTimeMs(executionTime);
            

        } catch (IllegalArgumentException e) {
            result.setSuccess(false);
            result.setError(e.getMessage());
        } catch (Exception e) {
            result.setSuccess(false);
            result.setError("Erro ao executar clustering: " + e.getMessage());
        }
        
        return result;
    }
    
    private static class GraphJson {
        public List<NodeJson> nodes = new ArrayList<>();
        public List<EdgeJson> edges = new ArrayList<>();
    }
    
    private static class NodeJson {
        public Integer id;
        public String label;
        public String type;
        public Double demand;
    }
    
    private static class EdgeJson {
        public Integer id;
        public Integer sourceId;
        public Integer targetId;
        public Double weight;
    }

    // {
    // "nodes": [
    //     {
    //     "id": 1,
    //     "label": "",
    //     "type": "NORMAL"
    //     },
    //     {
    //     "id": 2,
    //     "label": "",
    //     "type": "NORMAL"
    //     }
    // ],
    // "edges": [
    //     {
    //     "id": 1,
    //     "sourceId": 1,
    //     "targetId": 2,
    //     "weight": 1.0
    //     }
    // ]
    // }
}
