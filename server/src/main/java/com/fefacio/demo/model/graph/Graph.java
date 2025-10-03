package com.fefacio.demo.model.graph;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Graph {
    private List<Node> nodeList;
    private List<Edge> edgeList;
    private Map<Node, List<Edge>> adjacencyList;
    
    public Graph() {
        this.nodeList = new ArrayList<>();
        this.edgeList = new ArrayList<>();
        this.adjacencyList = new HashMap<>();
    }

    public void addNode(Node node){
        nodeList.add(node);
        if (adjacencyList.containsKey(node)){
            throw new IllegalStateException("Node "+node+" already exists!");
        }
        adjacencyList.put(node, new ArrayList<>());
        System.out.println("Added node: "+node);
    }

    public Node getNodeById(Integer nodeId){
         return nodeList.stream()
                   .filter(node -> node.getId().equals(nodeId))
                   .findFirst()  
                   .orElseThrow(() -> new RuntimeException(
                        String.format("Node with id %d not found", nodeId)
                    ));
    }

    public boolean removeNodeById(Integer id){
       return nodeList.removeIf(node -> node.getId().equals(id));
    }

    public void addEdge(Edge edge){
        Node source = edge.getSource();
        Node target = edge.getTarget();

        if (!adjacencyList.containsKey(source) || !adjacencyList.containsKey(target)){
            throw new IllegalArgumentException("Source or target node doesn't exist!");
        }
        edgeList.add(edge);
        adjacencyList.get(edge.getSource()).add(edge);
        adjacencyList.get(edge.getTarget()).add(edge);
        System.out.println("Added edge: "+edge);
    }

    public Edge getEdgeById(Integer edgeId){
        return edgeList.stream()
                   .filter(node -> node.getId().equals(edgeId))
                   .findFirst()  
                   .orElseThrow(() -> new RuntimeException(
                        String.format("Edge with id %d not found", edgeId)
                    ));
    }

    public boolean removeEdgeById(Integer edgeId){
       return edgeList.removeIf(edge -> edge.getId().equals(edgeId));
    }

    public void clear(){
        nodeList.clear();
        edgeList.clear();
        System.out.println("NodeList length: "+nodeList.size());
        System.out.println("EdgeList length: "+edgeList.size());
    }

    

    public Map<Node, List<Edge>> getAdjacencyList() { return adjacencyList; }
    public void setAdjacencyList(Map<Node, List<Edge>> adjacencyList) { this.adjacencyList = adjacencyList; }

    @Override
    public String toString(){
        return "Adjacency List: "+adjacencyList;
    }

}
