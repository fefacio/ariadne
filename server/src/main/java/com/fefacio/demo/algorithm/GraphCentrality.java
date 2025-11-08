package com.fefacio.demo.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;

public class GraphCentrality {
    private Graph graph;
    private GraphSearch graphSearch;

    public GraphCentrality(Graph graph) {
        System.out.println("IS GRAPH CONNECT? "+graph.isConnected());
        if (!graph.isConnected()) {
            throw new IllegalArgumentException("GraphCentrality requires a connected graph.");
        }

        this.graph = graph;
        this.graphSearch = new GraphSearch(graph);
    }

    
    public Map<Integer, Double> degreeCentrality() {
        Map<Integer, Double> centrality = new HashMap<>();
        int n = graph.getNodeCount();

        
        for (Node node : graph.getNodes()) {
            double degree = graph.getDegree(node);
            System.out.println("DEGREE:" +degree);
            if (degree == 0){
                centrality.put(node.getId(), degree);
            } else {
                centrality.put(node.getId(), degree / (n - 1));
            }
            
        }
        
        return centrality;
    }
    


    public Map<Integer, Double> closenessCentrality() {
        Map<Integer, Double> centrality = new HashMap<>();
        
        for (Node node : graph.getNodes()) {
            Map<Node, Double> distances = graphSearch.getDistancesDijkstra(node);
            
            double sumDistances = 0.0;
            int reachableNodes = 0;
            
            for (Map.Entry<Node, Double> entry : distances.entrySet()) {
                if (!entry.getKey().equals(node) && entry.getValue() < Double.POSITIVE_INFINITY) {
                    sumDistances += entry.getValue();
                    reachableNodes++;
                }
            }
            
            double closeness = reachableNodes > 0 ? reachableNodes / sumDistances : 0.0;
            centrality.put(node.getId(), closeness);
        }
        
        return centrality;
    }

    // Brandes (2001)
    public Map<Integer, Double> betweennessCentrality(boolean isWeighted) {
        Map<Integer, Double> centrality = new HashMap<>();
        
        for (Node node : graph.getNodes()) {
            centrality.put(node.getId(), 0.0);
        }

        List<Node> nodes = graph.getNodes();
        
        for (Node source : nodes) {
            Map<Node, List<Node>> predecessors;
            Map<Node, Integer> sigma; 
            List<Node> stack;
            
            if (isWeighted){
                GraphSearch.DijkstraResult dijkstraResult = graphSearch.getDijkstraPaths(source);
                predecessors = dijkstraResult.predecessors;
                sigma = dijkstraResult.sigma;
                stack = dijkstraResult.stack;
            } else {
                GraphSearch.BFSResult bfsResult = graphSearch.getBFSPaths(source);
                predecessors = bfsResult.predecessors;
                sigma = bfsResult.sigma;
                stack = bfsResult.stack;
            } 
            
            Map<Node, Double> delta = new HashMap<>();
            for (Node node : nodes){
                delta.put(node, 0.0);
            }
            
            for (int i=stack.size()-1; i>=0; i--){
                Node w = stack.get(i);
                for (Node v : predecessors.get(w)){
                    double c = (sigma.get(v)/ (double) sigma.get(w)) * (1.0 + delta.get(w));
                    delta.put(v, delta.get(v) + c);
                }

                if (!w.equals(source)){
                    centrality.put(w.getId(), centrality.get(w.getId()) + delta.get(w));
                }
            }
        }
        // Normalization
        int n = nodes.size();
        double normalization = (n - 1) * (n - 2);
        
        if (normalization > 0) {
            for (Node node : nodes) {
                centrality.put(node.getId(), centrality.get(node.getId()) / normalization);
            }
        }
        return centrality;
    }
    public Map<Integer, Double> betweennessCentrality(){
        return betweennessCentrality(false);
    }

    

    public Double nodeDegreeCentrality(Node node){
        Map<Integer, Double> centrality = degreeCentrality();
        Double degree = centrality.get(node.getId());
        if (degree==null) return -1.0;

        return Math.round(degree*100.0)/100.0;
    }

    public Double nodeClosenessCentrality(Node node){
        Map<Integer, Double> centrality = closenessCentrality();
        Double closeness = centrality.get(node.getId());
        if (closeness==null) return -1.0;

        return Math.round(closeness*100.0)/100.0;
    }

    public Double nodeBetweennessCentrality(Node node, boolean isWeighted){
        Map<Integer, Double> centrality = betweennessCentrality(isWeighted);
        Double betweenness = centrality.get(node.getId());
        if (betweenness==null) return -1.0;

        return Math.round(betweenness*100.0)/100.0;
    }
    
}
