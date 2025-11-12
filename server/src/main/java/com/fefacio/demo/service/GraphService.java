package com.fefacio.demo.service;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.DoubleStream;

import org.springframework.stereotype.Service;

import com.fefacio.demo.algorithm.GraphCentrality;
import com.fefacio.demo.algorithm.GraphClustering;
import com.fefacio.demo.algorithm.GraphSearch;
import com.fefacio.demo.algorithm.GraphStats;
import com.fefacio.demo.algorithm.pmedian.PMedianClustering;
import com.fefacio.demo.algorithm.pmedian.PMedianGreedy;
import com.fefacio.demo.algorithm.pmedian.PMedianInterchange;
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
import com.fefacio.demo.model.response.StatsNodeResponse;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

@Service
public class GraphService {
    private Graph graph = new Graph();
    private GraphSearch search = new GraphSearch(graph);
    private final Gson gson = new Gson();
    
    public NodeResponse getNode(Integer nodeId){
        Node node = graph.getNodeById(nodeId);
        return NodeResponse.from(node);
    }

    public NodeResponse addNode(NodeRequest nodeRequest){
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
        if (node.getType() == NodeType.CONSUMER) {
            if (nodeRequest.getDemand()!=null){
                node.setDemand(nodeRequest.getDemand());
            } else {
                node.setDemand(1.0);
            }    
        } else {
            node.setDemand(null);
        }

        graph.addNode(node);
        return NodeResponse.from(node);
    }

    public NodeResponse updateNode(Integer nodeId, NodeRequest nodeRequest) {
        Node node = graph.getNodeById(nodeId);
        
        StringBuilder sb = new StringBuilder("Update node: Old ")
            .append(node.toString());
        
        if (nodeRequest.getType() != null) {
            NodeType newType = NodeType.valueOf(nodeRequest.getType().toUpperCase());
            node.setType(newType);
        }
        if (node.getType() == NodeType.CONSUMER) {
            if (nodeRequest.getDemand()!=null){
                node.setDemand(nodeRequest.getDemand());
            } else {
                node.setDemand(1.0);
            }    
        }
        if (node.getType() != NodeType.CONSUMER) {
            node.setDemand(null);
        }
        sb.append(" | New ").append(node.toString());
        System.out.println(sb.toString());
        
        return NodeResponse.from(node);
    }

    public boolean removeNode(Integer nodeId){
        return graph.removeNodeById(nodeId);
    }

    public EdgeResponse getEdge(Integer edgeId){
        Edge edge = graph.getEdgeById(edgeId);
        return EdgeResponse.from(edge);

    }

    public synchronized List<EdgeResponse> addEdge(EdgeRequest edgeRequest){
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

        return List.of(
            EdgeResponse.from(forwardEdge),
            EdgeResponse.from(backwardEdge)
        );
    }

    public synchronized EdgeResponse updateEdge(Integer edgeId, EdgeRequest edgeRequest){
        StringBuilder sb = new StringBuilder("Update edge: Old ");
        Edge edge = graph.getEdgeById(edgeId);
        sb.append(edge.toString());
        Double weight = edgeRequest.getWeight();
        if (weight!=null){
            edge.setWeight(weight);
        }
        sb.append("| New ");
        sb.append(edge.toString());
        System.out.println(sb.toString());
        return EdgeResponse.from(edge);
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


    public String exportGraphJson(String filePath) {
        GraphJson graphJson = new GraphJson();
        
        for (Node node : graph.getNodes()) {
            NodeJson nodeJson = new NodeJson();
            nodeJson.id = node.getId();
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
    

    public String exportGraphJson() {
        return exportGraphJson(null);
    }


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
                NodeResponse node = this.addNode(new NodeRequest(nodeJson.type, nodeJson.demand));
                jsonIdToNodeIdMap.put(nodeJson.id, node.getId());
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
        return graph.getNodes().stream().map(NodeResponse::from).collect(Collectors.toList());
    }

    public List<EdgeResponse> getAllEdges() {
        return graph.getEdges().stream().map(EdgeResponse::from).collect(Collectors.toList());
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

    public byte[] getDistanceMatrix() {
        List<Node> nodes = graph.getNodes();
        try {
            StringBuilder csv = new StringBuilder();
            
            // Header
            String header = "";
            for (int i=0; i<nodes.size(); i++){
                header += String.format(",%d", nodes.get(i).getId());
            }
            header += "\n";
            csv.append(header);
            
            GraphSearch graphSearch = new GraphSearch(graph);
            for (int i=0; i<nodes.size(); i++) {
                Node node = nodes.get(i);
                Map<Node, Double> distance = graphSearch.getDistancesDijkstra(node);
                System.out.println("Distances found for node " + node.getId() + ": "+distance);
                csv.append(String.format("%d", node.getId()));
                for (Node neighbor : distance.keySet()){
                    csv.append(String.format(",%f", distance.get(neighbor)));
                }
                csv.append("\n");
            }
            
            return csv.toString().getBytes(StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            System.err.println("Error generating distance matrix: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate distance matrix", e);
        }
    }

    public byte[] getDemandMatrix() {
        List<Node> nodes = graph.getNodes();
        try {
            StringBuilder csv = new StringBuilder();
            
            // Header
            String header = ",Demand\n";
            csv.append(header);
            for (Node node : nodes){
                if (node.getType()==NodeType.CONSUMER){
                    csv.append(String.format("C%d,%f\n", node.getId(), node.getDemand()));
                }
            }
            return csv.toString().getBytes(StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            System.err.println("Error generating demand matrix: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate demand matrix", e);
        }
    }

    public PMedianResponse graphPMedian(String algorithm, Integer p, boolean useDemand, boolean useRandomInitialized){
        PMedianResponse pMedianResponse = new PMedianResponse(p);
        
        try {
            Graph.CostMatrixResult costMatrixResult = graph.getCostMatrixWithMapping();
            Graph.NodeDemandsResult nodeDemandsResult = graph.getNodeDemandsWithMapping();
            
            double[][] cost = costMatrixResult.getCostMatrix().getData();
            double[] weights;
            
            if (useDemand){
                weights = nodeDemandsResult.getDemands().stream().mapToDouble(Double::doubleValue).toArray();
            } else {
                weights = DoubleStream.generate(() -> 1.0).limit(nodeDemandsResult.getDemands().size()).toArray();
            }

            List<Integer> consumerIds = nodeDemandsResult.getConsumerIds();
            List<Integer> candidateIds = costMatrixResult.getCandidateIds();
            
            switch (algorithm){
                case "GREEDY":
                    System.out.println("HELLO3");
                    PMedianGreedy greedy = new PMedianGreedy(cost, weights, p, consumerIds, candidateIds);
                    greedy.solve(); 
                    pMedianResponse.setFacilities(greedy.getSolutionNodeIds()); 
                    pMedianResponse.setCost(greedy.getSolutionCost()); 
                    pMedianResponse.setAssignments(greedy.getAssignmentsWithNodeIds());
                    System.out.println("HELLO4");
                    break;
                    
                case "INTERCHANGE":
                    PMedianInterchange interchange = new PMedianInterchange(cost, weights, p, consumerIds, candidateIds, useRandomInitialized);
                    interchange.solve(); 
                    pMedianResponse.setFacilities(interchange.getSolutionNodeIds()); 
                    pMedianResponse.setCost(interchange.getSolutionCost());
                    pMedianResponse.setAssignments(interchange.getAssignmentsWithNodeIds());
                    break;
                
                case "CLUSTERING":
                    PMedianClustering clusteringAlg = new PMedianClustering(cost, weights, p, consumerIds, candidateIds, graph);
                    clusteringAlg.solve();
                    pMedianResponse.setFacilities(clusteringAlg.getSolutionNodeIds());
                    pMedianResponse.setCost(clusteringAlg.getSolutionCost());
                    pMedianResponse.setAssignments(clusteringAlg.getAssignmentsWithNodeIds());
                    break;
                    
                default:
                    throw new IllegalArgumentException("Unknown algorithm: " + algorithm);
            }
            
        } catch (IllegalStateException e) {
            pMedianResponse.setError("Clustering error: " + e.getMessage());
            System.err.println("P-Median clustering error: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            pMedianResponse.setError("Invalid argument: " + e.getMessage());
            System.err.println("P-Median argument error: " + e.getMessage());
        } catch (Exception e) {
            pMedianResponse.setError("Unexpected error: " + e.getMessage());
            System.err.println("P-Median unexpected error: " + e.getMessage());
            e.printStackTrace();
        }

        return pMedianResponse;
    }



    public byte[] getCostMatrix() {
        List<Node> consumers = graph.getConsumerNodes();
        List<Node> candidates = graph.getFacilityCandidates();
        try {
            StringBuilder csv = new StringBuilder();
            
            // Header
            String header = "";
            for (int i=0; i<candidates.size(); i++){
                header += String.format(",F%d", candidates.get(i).getId());
            }
            header += "\n";
            csv.append(header);
            
            GraphSearch graphSearch = new GraphSearch(graph);
            for (int i=0; i<consumers.size(); i++) {
                Node node = consumers.get(i);
                Map<Node, Double> distance = graphSearch.getDistancesDijkstra(node);
                csv.append(String.format("C%d", node.getId()));
                for (Node neighbor : distance.keySet()){
                    if (neighbor.getType()!=NodeType.CONSUMER){
                        csv.append(String.format(",%f", distance.get(neighbor)));
                    }
                }
                csv.append("\n");
            }
            
            return csv.toString().getBytes(StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            System.err.println("Error generating cost matrix: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate cost matrix", e);
        }
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
    //     "type": "NORMAL"
    //     },
    //     {
    //     "id": 2,
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
