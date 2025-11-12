package com.fefacio.demo.algorithm;

import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.response.SearchResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Set;
import java.util.TreeMap;

import com.fefacio.demo.model.graph.Edge;


public class GraphSearch {
    
    private final Graph graph;
    
    public GraphSearch(Graph graph) {
        this.graph = graph;
    }
    


    public Map<Node, Integer> getDistancesBFS(Node sourceNode) {
        Map<Node, Integer> distances = new HashMap<>();
        Queue<Node> queue = new LinkedList<>();
        
        distances.put(sourceNode, 0);
        queue.add(sourceNode);
        
        while (!queue.isEmpty()) {
            Node current = queue.poll();
            int currentDistance = distances.get(current);
            List<Node> neighbors = graph.getNeighbors(current);
            for (Node neighbor : neighbors) {
                if (!distances.containsKey(neighbor)) {
                    distances.put(neighbor, currentDistance + 1);
                    queue.add(neighbor);
                }
            }
        }
        return distances;
    }
    
    
    public SearchResponse searchBFS(Node sourceNode, Node targetNode) {
        SearchResponse response = new SearchResponse("BFS", sourceNode.getId(), targetNode.getId());
        if (sourceNode.equals(targetNode)) {
            response.setFound(true);
            response.setCost(0);
            response.setPath(Collections.emptyList());
            return response;
        }
        
        Map<Node, Node> parent = new HashMap<>();
        Map<Node, Integer> distance = new HashMap<>();
        Queue<Node> queue = new LinkedList<>();
        
        parent.put(sourceNode, null);
        distance.put(sourceNode, 0);
        queue.add(sourceNode);
        
        while (!queue.isEmpty()) {
            Node current = queue.poll();
            List<Node> neighbors = graph.getNeighbors(current);
            
            if (current.equals(targetNode)) {
                List<Node> path = reconstructPath(parent, targetNode);
                response.setFound(true);
                response.setCost(distance.get(targetNode));
                response.setPath(path);
                return response;
            }
            
            for (Node neighbor : neighbors) {
                if (!parent.containsKey(neighbor)) {
                    parent.put(neighbor, current);
                    distance.put(neighbor, distance.get(current) + 1);
                    queue.add(neighbor);
                }
            }
        }
        return response;
    }

    public BFSResult getBFSPaths(Node sourceNode) {
        BFSResult result = new BFSResult();
        Map<Node, List<Node>> predecessors = new HashMap<>();
        Map<Node, Integer> sigma = new HashMap<>();
        Map<Node, Integer> distance = new HashMap<>();
        
        List<Node> nodes = graph.getNodes();
        
        for (Node node : nodes) {
            predecessors.put(node, new ArrayList<>());
            sigma.put(node, 0);
            distance.put(node, -1);
        }
        
        sigma.put(sourceNode, 1);
        distance.put(sourceNode, 0);
        
        Queue<Node> queue = new LinkedList<>();
        queue.add(sourceNode);
        
        List<Node> stack = new ArrayList<>();
        
        while (!queue.isEmpty()) {
            Node v = queue.poll();
            stack.add(v);
            
            for (Node w : graph.getNeighbors(v)) {
                if (distance.get(w) < 0) {
                    queue.add(w);
                    distance.put(w, distance.get(v) + 1);
                }
                
                if (distance.get(w) == distance.get(v) + 1) {
                    sigma.put(w, sigma.get(w) + sigma.get(v));
                    predecessors.get(w).add(v);
                }
            }
        }
        
        result.predecessors = predecessors;
        result.sigma = sigma;
        result.distance = distance;
        result.stack = stack;
        
        return result;
    }
    
    public SearchResponse searchDFS(Node sourceNode, Node targetNode) {
        Set<Node> visited = new HashSet<>();
        List<Node> path = new ArrayList<>();
        SearchResponse response = new SearchResponse("DFS", sourceNode.getId(), targetNode.getId());
        if (dfsRecursive(sourceNode, targetNode, visited, path)) {
            response.setFound(true);
            response.setCost(path.size()-1);
            response.setPath(path);
            return response;
        }
        
        return response;
    }
    
    private boolean dfsRecursive(Node current, Node target, Set<Node> visited, List<Node> path) {
        visited.add(current);
        path.add(current);
        
        if (current.equals(target)) {
            return true;
        }
        
        for (Node neighbor : graph.getNeighbors(current)) {
            if (!visited.contains(neighbor)) {
                if (dfsRecursive(neighbor, target, visited, path)) {
                    return true;
                }
            }
        }
        
        path.remove(path.size() - 1); // Backtrack
        return false;
    }

    public SearchResponse searchGreedy(Node sourceNode, Node targetNode) {
        SearchResponse response = new SearchResponse("GREEDY", sourceNode.getId(), targetNode.getId());
        
        if (sourceNode.equals(targetNode)) {
            response.setFound(true);
            response.setCost(0);
            response.setPath(Collections.singletonList(sourceNode));
            return response;
        }
        
        Map<Node, Node> parent = new HashMap<>();
        Map<Node, Double> costSoFar = new HashMap<>();
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        Set<Node> visited = new HashSet<>();
        
        parent.put(sourceNode, null);
        costSoFar.put(sourceNode, 0.0);
        pq.add(new NodeDistance(sourceNode, 0.0));
        
        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Node currentNode = current.node;
            
            if (visited.contains(currentNode)) continue;
            visited.add(currentNode);
            
            if (currentNode.equals(targetNode)) {
                List<Node> path = reconstructPath(parent, targetNode);
                response.setFound(true);
                response.setCost(costSoFar.get(targetNode));
                response.setPath(path);
                return response;
            }
            
            for (Edge edge : graph.getEdges(currentNode)) {
                Node neighbor = edge.getTarget();
                
                if (!visited.contains(neighbor)) {
                    double newCost = costSoFar.get(currentNode) + edge.getWeight();
                    parent.put(neighbor, currentNode);
                    costSoFar.put(neighbor, newCost);
                    
                    pq.add(new NodeDistance(neighbor, edge.getWeight()));
                }
            }
        }
        
        return response;
    }
    
    public SearchResponse searchDijkstra(Node sourceNode, Node targetNode) {
        Map<Node, Double> distances = new HashMap<>();
        Map<Node, Node> parent = new HashMap<>();
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        Set<Node> visited = new HashSet<>();
        SearchResponse response = new SearchResponse("DIJKSTRA", sourceNode.getId(), targetNode.getId());
        for (Node node : graph.getNodes()) {
            distances.put(node, Double.POSITIVE_INFINITY);
        }
        distances.put(sourceNode, 0.0);
        pq.add(new NodeDistance(sourceNode, 0.0));
        parent.put(sourceNode, null);
        
        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Node currentNode = current.node;
            
            if (visited.contains(currentNode)) continue;
            visited.add(currentNode);
            
            if (currentNode.equals(targetNode)) {
                List<Node> path = reconstructPath(parent, targetNode);
                response.setFound(true);
                response.setCost(distances.get(targetNode));
                response.setPath(path);
                return response;
            }
            
            for (Edge edge : graph.getEdges(currentNode)) {
                Node neighbor = edge.getTarget();
                double newDistance = distances.get(currentNode) + edge.getWeight();
                
                if (newDistance < distances.get(neighbor)) {
                    distances.put(neighbor, newDistance);
                    parent.put(neighbor, currentNode);
                    pq.add(new NodeDistance(neighbor, newDistance));
                }
            }
        }
        
        return response;
    }

    public DijkstraResult getDijkstraPaths(Node sourceNode) {
        DijkstraResult result = new DijkstraResult();
        Map<Node, List<Node>> predecessors = new HashMap<>();
        Map<Node, Integer> sigma = new HashMap<>();
        Map<Node, Double> distance = new HashMap<>();
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        List<Node> nodes = graph.getNodes();
        
        for (Node node : nodes) {
            predecessors.put(node, new ArrayList<>());
            sigma.put(node, 0);
            distance.put(node, Double.POSITIVE_INFINITY);
        }
        
        sigma.put(sourceNode, 1);
        distance.put(sourceNode, 0.0);
        pq.add(new NodeDistance(sourceNode, 0.0));
        
        List<Node> stack = new ArrayList<>();
        
        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Node v = current.node;
            double vDist = current.distance;
            
            if (vDist > distance.get(v)) continue;
            
            stack.add(v);
            List<Edge> edges = graph.getEdges(v);
            if (edges == null) continue;
            
            for (Edge edge : edges) {
                Node w = edge.getTarget();
                double weight = edge.getWeight();
                double altDist = distance.get(v) + weight;
                
                if (altDist < distance.get(w)) {
                    distance.put(w, altDist);
                    predecessors.put(w, new ArrayList<>());
                    predecessors.get(w).add(v);
                    sigma.put(w, sigma.get(v));
                    pq.add(new NodeDistance(w, altDist));
                    
                } else if (Math.abs(altDist - distance.get(w)) < 1e-9) {
                    predecessors.get(w).add(v);
                    sigma.put(w, sigma.get(w) + sigma.get(v));
                }
            }
        }
        
        result.predecessors = predecessors;
        result.sigma = sigma;
        result.distance = distance;
        result.stack = stack;
        
        return result;
    }

    public Map<Node, Double> getDistancesDijkstra(Node sourceNode) {
        Map<Node, Double> distances = new TreeMap<>(Comparator.comparing(Node::getId));
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        Set<Node> visited = new HashSet<>();
        
        for (Node node : graph.getNodes()) {
            distances.put(node, Double.POSITIVE_INFINITY);
        }
        distances.put(sourceNode, 0.0);
        pq.add(new NodeDistance(sourceNode, 0.0));
        
        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Node currentNode = current.node;
            
            if (visited.contains(currentNode)) continue;
            visited.add(currentNode);
            
            for (Edge edge : graph.getEdges(currentNode)) {
                Node neighbor = edge.getTarget();
                double newDistance = distances.get(currentNode) + edge.getWeight();
                
                if (newDistance < distances.get(neighbor)) {
                    distances.put(neighbor, newDistance);
                    pq.add(new NodeDistance(neighbor, newDistance));
                }
            }
        }
        
        return distances;
    }
    
    
    public boolean hasCycle() {
        Set<Node> visited = new HashSet<>();
        Set<Node> recursionStack = new HashSet<>();
        
        for (Node node : graph.getNodes()) {
            if (!visited.contains(node)) {
                if (hasCycleDFS(node, visited, recursionStack, null)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    private boolean hasCycleDFS(Node current, Set<Node> visited, 
                               Set<Node> recursionStack, Node parent) {
        visited.add(current);
        recursionStack.add(current);
        
        for (Node neighbor : graph.getNeighbors(current)) {
            if (!visited.contains(neighbor)) {
                if (hasCycleDFS(neighbor, visited, recursionStack, current)) {
                    return true;
                }
            } else if (recursionStack.contains(neighbor) && !neighbor.equals(parent)) {
                return true; 
            }
        }
        
        recursionStack.remove(current);
        return false;
    }
    
    

    
    private List<Node> reconstructPath(Map<Node, Node> parent, Node targetNode) {
        List<Node> path = new ArrayList<>();
        Node current = targetNode;
        
        while (current != null) {
            path.add(0, current);
            current = parent.get(current);
        }
        
        return path;
    }
    
    
    
    
    
    private static class NodeDistance implements Comparable<NodeDistance> {
        Node node;
        double distance;
        
        NodeDistance(Node node, double distance) {
            this.node = node;
            this.distance = distance;
        }
        
        @Override
        public int compareTo(NodeDistance other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    public static class BFSResult {
        public Map<Node, List<Node>> predecessors;
        public Map<Node, Integer> sigma;
        public Map<Node, Integer> distance;
        public List<Node> stack; 
    }

    public static class DijkstraResult {
        public Map<Node, List<Node>> predecessors;
        public Map<Node, Integer> sigma;
        public Map<Node, Double> distance;
        public List<Node> stack;
    }
}