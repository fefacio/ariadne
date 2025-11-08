package com.fefacio.demo.algorithm;

import java.util.List;
import java.util.Map;

import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;

public class GraphStats {
    private final Graph graph;
    private final GraphSearch graphSearch;

    public GraphStats(Graph graph){
        this.graph = graph;
        this.graphSearch = new GraphSearch(graph);
    }

    public double graphDensity() {
        int n = graph.getNodeCount();
        if (n <= 1) return 0.0;
        
        int maxEdges = n * (n - 1);
        return (double) graph.getEdgeCount() / maxEdges;
    }

    public Double nodeEccentricity(Node node){
        Double maxDistance = 0.0;
        Map<Node, Double> distances = graphSearch.getDistancesDijkstra(node);
        for (Double dist : distances.values()) {
            if (dist < Double.POSITIVE_INFINITY) {
                maxDistance = Math.max(maxDistance, dist);
            }
        }
        return maxDistance;
    }

    public Double graphRadius() {
        Double radius = Double.POSITIVE_INFINITY;
        
        for (Node node : graph.getNodes()) {
            Double eccentricity = nodeEccentricity(node);
            if (eccentricity < Double.POSITIVE_INFINITY && eccentricity > 0) {
                radius = Math.min(radius, eccentricity);
            }
        }
        
        // Se nenhuma excentricidade válida foi encontrada, retorna 0
        return radius == Double.POSITIVE_INFINITY ? 0.0 : radius;
    }

    public Double graphDiameter() {
        Double diameter = 0.0;
        
        for (Node node : graph.getNodes()) {
            Double eccentricity = nodeEccentricity(node);
            if (eccentricity < Double.POSITIVE_INFINITY) { 
                diameter = Math.max(diameter, eccentricity);
            }
        } 
        return diameter;
    }

    public double averageGraphPathLength() {
        double sum = 0.0;
        int count = 0;
        
        for (Node source : graph.getNodes()) {
            Map<Node, Double> distances = graphSearch.getDistancesDijkstra(source);
            
            for (Map.Entry<Node, Double> entry : distances.entrySet()) {
                if (!entry.getKey().equals(source) && 
                    entry.getValue() < Double.POSITIVE_INFINITY) {
                    sum += entry.getValue();
                    count++;
                }
            }
        }
        
        return count > 0 ? sum / count : 0.0;
    }

    public double averageNodePathLength(Node node) {
        double sum = 0.0;
        int count = 0;
        
        Map<Node, Double> distances = graphSearch.getDistancesDijkstra(node);
            
        for (Map.Entry<Node, Double> entry : distances.entrySet()) {
            if (!entry.getKey().equals(node) && 
                entry.getValue() < Double.POSITIVE_INFINITY) {
                sum += entry.getValue();
                count++;
            }
        }
        if (count>0){
            return Math.round((sum/count)*100.0)/100.0;
        } else {
            return 0.0;
        }
    }

    public double averageClusteringCoefficient() {
        double sum = 0.0;
        int count = 0;
        
        for (Node node : graph.getNodes()) {
            List<Node> neighbors = graph.getNeighbors(node);
            int k = neighbors.size();
            
            if (k < 2) continue; 
            
            int triangles = 0;
            for (int i = 0; i < neighbors.size(); i++) {
                for (int j = i + 1; j < neighbors.size(); j++) {
                    if (graph.areConnected(neighbors.get(i), neighbors.get(j))) {
                        triangles++;
                    }
                }
            }
            
            double possibleTriangles = (k * (k - 1)) / 2.0;
            sum += triangles / possibleTriangles;
            count++;
        }
        
        return count > 0 ? sum / count : 0.0;
    }

    public double clusteringCoefficient(Node node){
        List<Node> neighbors = graph.getNeighbors(node);
        int k = neighbors.size();

        if (k < 2) return 0.0; 
            
        int triangles = 0;
        for (int i = 0; i < neighbors.size(); i++) {
            for (int j = i + 1; j < neighbors.size(); j++) {
                if (graph.areConnected(neighbors.get(i), neighbors.get(j))) {
                    triangles++;
                }
            }
        }
        
        double possibleTriangles = (k * (k - 1)) / 2.0;
        double clusteringCoefficient = triangles/possibleTriangles;
        return Math.round(clusteringCoefficient*100.0)/100.0;
    }
}
