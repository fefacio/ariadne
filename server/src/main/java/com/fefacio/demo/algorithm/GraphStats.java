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

    public double avgDemand() {
        if (graph.getNodeCount() == 0) return 0.0;
        List<Node> consumers = graph.getConsumerNodes();
        if (consumers.isEmpty()){
            return 0.0;
        }
        double sum = 0.0;
        for (Node node : consumers) {
            sum += node.getDemand();
        }
        
        return sum / consumers.size();
    }

    public double minDegree() {
        if (graph.getNodeCount() == 0) return 0.0;
        
        double min = Double.POSITIVE_INFINITY;
        for (Node node : graph.getNodes()) {
            double degree = graph.getDegree(node);
            min = Math.min(min, degree);
        }
        
        return min == Double.POSITIVE_INFINITY ? 0.0 : min;
    }

    public double maxDegree() {
        if (graph.getNodeCount() == 0) return 0.0;
        
        double max = 0.0;
        for (Node node : graph.getNodes()) {
            double degree = graph.getDegree(node);
            max = Math.max(max, degree);
        }
        
        return max;
    }

    public double avgDegree() {
        if (graph.getNodeCount() == 0) return 0.0;
        
        double sum = 0.0;
        for (Node node : graph.getNodes()) {
            sum += graph.getDegree(node);
        }
        
        return Math.round(sum/graph.getNodeCount()*100.0)/100.0;
    }

    public double minStrength() {
        if (graph.getNodeCount() == 0) return 0.0;
        
        double min = Double.POSITIVE_INFINITY;
        for (Node node : graph.getNodes()) {
            double strength = graph.getStrength(node);
            min = Math.min(min, strength);
        }
        
        return min == Double.POSITIVE_INFINITY ? 0.0 : min;
    }

    public double maxStrength() {
        if (graph.getNodeCount() == 0) return 0.0;
        
        double max = 0.0;
        for (Node node : graph.getNodes()) {
            double strength = graph.getStrength(node);
            max = Math.max(max, strength);
        }
        
        return max;
    }

    public double avgStrength() {
        if (graph.getNodeCount() == 0) return 0.0;
        
        double sum = 0.0;
        for (Node node : graph.getNodes()) {
            sum += graph.getStrength(node);
        }
        
        return Math.round(sum/graph.getNodeCount()*100.0)/100.0;
    }


    public double graphDensity() {
        int n = graph.getNodeCount();
        if (n <= 1) return 0.0;
        
        int maxEdges = n * (n - 1);
        double density = (double) graph.getEdgeCount() / maxEdges;
        return Math.round(density*100.0)/100.0;
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
        
        if (count>0) {
            return Math.round((sum/count)*100.0)/100.0;
        } else {
            return 0.0;
        }
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
        if (count>0) {
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
        if (count>0) {
            return Math.round((sum/count)*100.0)/100.0;
        } else {
            return 0.0;
        }
        
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
