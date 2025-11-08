package com.fefacio.demo.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fefacio.demo.algorithm.GraphCentrality;
import com.fefacio.demo.algorithm.GraphStats;
import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.response.StatsNodeResponse;

@Service
public class StatsService {
    private GraphService graphService;
    private Graph graph;

    public StatsService(GraphService graphService){
        this.graphService = graphService;
        this.graph = graphService.getGraph();
    }

    public StatsNodeResponse getNodeStatistics(Integer nodeId) {
        System.out.println("INSIDE NODE STATISTICS");
        graph.printAdjacencyList();
        
        GraphCentrality graphCentrality = new GraphCentrality(graph);
        GraphStats graphStats = new GraphStats(graph);
        
        Node node = graph.getNodeById(nodeId);
        
        if (node == null) {
            throw new IllegalArgumentException("Node not found: " + nodeId);
        }
        
        return buildNodeStats(node, graphCentrality, graphStats);
    }

    private StatsNodeResponse buildNodeStats(Node node, GraphCentrality graphCentrality, GraphStats graphStats) {
        StatsNodeResponse response = new StatsNodeResponse();
        
        response.setId(node.getId());
        response.setLabel(node.getLabel());
        response.setType(node.getType().name());
        
        double degree = graph.getDegree(node);
        response.setDegree(degree);
        response.setNormalizedDegree(graphCentrality.nodeDegreeCentrality(node));

        List<Integer> neighborIds = new ArrayList<>();
        List<Edge> edges = graph.getAdjacencyList().getOrDefault(node, new ArrayList<>());
        for (Edge edge : edges) {
            neighborIds.add(edge.getTarget().getId());
        }
        response.setNeighborIds(neighborIds);
        
        response.setBetweennessCentrality(graphCentrality.nodeBetweennessCentrality(node, graph.isWeighted()));
        response.setClosenessCentrality(graphCentrality.nodeClosenessCentrality(node));
        
        response.setAveragePathLength(graphStats.averageNodePathLength(node));
        response.setClusteringCoefficient(graphStats.clusteringCoefficient(node));
        response.setEccentricity(graphStats.nodeEccentricity(node));
        
        return response;
    }

    public byte[] getNodesReport() {
        try {
            StringBuilder csv = new StringBuilder();
            
            // Header
            csv.append("ID,Label,Type,Degree,Normalized Degree,Betweenness,Closeness,")
               .append("Avg Path Length,Clustering Coefficient,Eccentricity\n");
            

            GraphCentrality graphCentrality = new GraphCentrality(graph);
            GraphStats graphStats = new GraphStats(graph);
            
            List<Node> nodes = graph.getNodes();
            for (Node node : nodes) {
                // REUTILIZA o método!
                StatsNodeResponse stats = buildNodeStats(node, graphCentrality, graphStats);
                
                csv.append(stats.getId()).append(",")
                   .append(stats.getLabel()).append(",")
                   .append(stats.getType()).append(",")
                   .append(stats.getDegree()).append(",")
                   .append(stats.getNormalizedDegree()).append(",")
                   .append(stats.getBetweennessCentrality()).append(",")
                   .append(stats.getClosenessCentrality()).append(",")
                   .append(stats.getAveragePathLength()).append(",")
                   .append(stats.getClusteringCoefficient()).append(",")
                   .append(stats.getEccentricity()).append("\n");
            }
            
            return csv.toString().getBytes(StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            System.err.println("Error generating nodes report: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate nodes report", e);
        }
    }
}