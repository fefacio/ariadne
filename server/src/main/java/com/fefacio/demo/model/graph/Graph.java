/* 
No backend - sempre que adicionar uma aresta entre dois nós
são adicionados duas arestas para representar a ligação
Ex
____     ____
| 1 |----| 2 |
----     ----
Edge : Source Node 1 | Target Node 2
Edge : Source Node 2 | Target Node 1

Sendo assim a lista de adjacência salva a informação para os dois nós
Node 1 -> Edge (Source Node 1 | Target Node 2)
Node 2 -> Edge (Source Node 2 | Target Node 1) 

Esse comportamento é esperado para grafos não direcionados, que é o caso deste projeto

O Comportamento já é tratado no backend, sendo assim, no frontend é esperado passar 
apenas uma vez o DTO que representa a ligação (sourceId, targetId, weight?)
*/
package com.fefacio.demo.model.graph;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;

import com.fefacio.demo.algorithm.GraphSearch;

public class Graph {
    private List<Node> nodeList;
    private List<Edge> edgeList;
    private Map<Node, List<Edge>> adjacencyList;


    // Mapping nodeId to Matrix Index
    private Map<Integer, Integer> nodeIdToIndex;
    private Map<Integer, Integer> indexToNodeId;

    // Matrix Cache
    private RealMatrix adjacencyMatrix;
    private RealMatrix degreeMatrix;
    private RealMatrix laplacianMatrix;
    private boolean matrixCacheValid = false;
    
    public Graph() {
        this.nodeList = new ArrayList<>();
        this.edgeList = new ArrayList<>();
        this.adjacencyList = new HashMap<>();
        this.nodeIdToIndex = new HashMap<>();
        this.indexToNodeId = new HashMap<>();
    }

    // *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
    // |  NODE METHODS START     |
    // *-------------------------*
    public void addNode(Node node){
        nodeList.add(node);
        if (adjacencyList.containsKey(node)){
            throw new IllegalStateException("Node "+node+" already exists!");
        }
        adjacencyList.put(node, new ArrayList<>());
        System.out.println("Added node: "+node);
        invalidateMatrixCache();
    }

    public Node getNodeById(Integer nodeId){
        return nodeList.stream()
            .filter(node -> node.getId().equals(nodeId))
            .findFirst()  
            .orElseThrow(() -> new RuntimeException(
                String.format("Node with id %d not found", nodeId)
            ));
    }

    public synchronized boolean removeNodeById(Integer id){
        Node nodeToRemove = getNodeById(id);
        List<Edge> edgesToRemove = new ArrayList<>();
        
        for (Edge edge : edgeList) {
            if (edge.getSource().getId().equals(id) || edge.getTarget().getId().equals(id)) {
                edgesToRemove.add(edge);
            }
        }
        //Remove from edgeList
        edgeList.removeAll(edgesToRemove);
        //Remove from adjacencyList
        for (Node node : nodeList) {
            List<Edge> edges = adjacencyList.get(node);
            if (edges != null) {
                edges.removeIf(edge -> 
                    edge.getSource().getId().equals(id) || 
                    edge.getTarget().getId().equals(id)
                );
            }
        }
        
        // Remove node from adjacencyList
        adjacencyList.remove(nodeToRemove);
        
        // Remove node from nodeList
        boolean removed = nodeList.removeIf(node -> node.getId().equals(id));
        
        if (removed){
            invalidateMatrixCache();
            System.out.println("Removed node: " + nodeToRemove + " and " + edgesToRemove.size() + " connected edge(s)");
        }
        
        return removed;
    }

    public List<Node> getNeighbors(Node node) {
        List<Node> neighbors = new ArrayList<>();

        List<Edge> edges = adjacencyList.get(node);
        if (edges != null) {
            for (Edge edge : edges) {
                if (edge.getSource().equals(node)) {
                    neighbors.add(edge.getTarget());
                }
            }
        }
        return neighbors;
    }

    public List<Node> getCustomerNodes() { 
        return this.nodeList.stream()
            .filter(n -> n.getType() == NodeType.CONSUMER)
            .toList();
    }

    public List<Node> getFacilityCandidates() {
        return this.nodeList.stream()
            .filter(n -> n.getType() != NodeType.CONSUMER)
            .toList();
    }

    public List<Double> getNodeDemands() {
        return nodeList.stream()
            .map(Node::getDemand)
            .collect(Collectors.toList());
    }

    public Integer getNodeCount(){ return this.nodeList.size(); }
    public List<Node> getNodes(){ return new ArrayList<>(nodeList); }
    // *-------------------------*
    // |  NODE METHODS END       |
    // *^^^^^^^^^^^^^^^^^^^^^^^^^*



    // *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
    // |  EDGE METHODS START     |
    // *-------------------------*
    public synchronized void addEdge(Edge edge){
        Node source = edge.getSource();
        Node target = edge.getTarget();

        if (!adjacencyList.containsKey(source) || !adjacencyList.containsKey(target)){
            throw new IllegalArgumentException("Source or target node doesn't exist!");
        }
        edgeList.add(edge);
        adjacencyList.get(edge.getSource()).add(edge);
        System.out.println("Added edge: "+edge);
        invalidateMatrixCache();
    }

    public synchronized List<Integer> addUndirectedEdge(Node source, Node target, Double weight) {
        Edge forwardEdge = new Edge(source, target, weight);
        Edge backwardEdge = new Edge(target, source, weight);
        addEdge(forwardEdge);
        addEdge(backwardEdge);
        
        return new ArrayList<>(List.of(forwardEdge.getId(), backwardEdge.getId()));
    }

    public Edge getEdgeById(Integer edgeId){
        return edgeList.stream()
            .filter(node -> node.getId().equals(edgeId))
            .findFirst()  
            .orElseThrow(() -> new RuntimeException(
                String.format("Edge with id %d not found", edgeId)
            ));
    }

    public synchronized boolean removeEdgeById(Integer edgeId){        
        Edge edgeToRemove = getEdgeById(edgeId);
        //printAdjacencyList();
        System.out.println("Removed edge: "+ edgeToRemove);
        boolean removed = edgeList.removeIf(edge -> edge.getId().equals(edgeId));
        if (removed){
            Node source = edgeToRemove.getSource();
            List<Edge> edges = adjacencyList.get(source);
            if (edges != null){
                edges.removeIf(edge -> edge.getId().equals(edgeId));
            }
            invalidateMatrixCache();
        }
        return removed;
    }

    public List<Edge> getEdges(Node node) {
        return adjacencyList.get(node);
    }

    public Edge getReverseEdge(Edge edge){
        for (Edge e : edgeList){
            if (e.getSource().equals(edge.getTarget())){
                return e;
            }
        }
        return edge;
    }

    public double getEdgeWeightFromNodes(Node source, Node target) {
        for (Edge edge : edgeList) {
            if (edge.getSource().equals(source) && edge.getTarget().equals(target)) {
                return edge.getWeight();
            }
        }
        return 0.0;
    }

    public Integer getEdgeCount(){ return this.edgeList.size(); }
    public List<Edge> getEdges(){ return new ArrayList<>(edgeList); }
    // *-------------------------*
    // |  EDGE METHODS END       |
    // *^^^^^^^^^^^^^^^^^^^^^^^^^*




    // *^^^^^^^^^^^^^^^^^^^^^^^^^*                        
    // | MATRIX METHODS START    |
    // *-------------------------*
    private void invalidateMatrixCache() {
        matrixCacheValid = false;
        adjacencyMatrix = null;
        degreeMatrix = null;
        laplacianMatrix = null;
        nodeIdToIndex.clear();
        indexToNodeId.clear();
    }

    private void initializeIndexMappings() {
        if (!nodeIdToIndex.isEmpty()) return;
        
        int index = 0;
        for (Node node : nodeList) {
            nodeIdToIndex.put(node.getId(), index);
            indexToNodeId.put(index, node.getId());
            index++;
        }
    }

    private void buildMatrices() {
        initializeIndexMappings();
        int n = getNodeCount();
        
        adjacencyMatrix = MatrixUtils.createRealMatrix(n, n);
        degreeMatrix = MatrixUtils.createRealMatrix(n, n);
        
        // Adjacency Matrix
        for (Node node : nodeList) {
            int i = nodeIdToIndex.get(node.getId());
            
            for (Edge edge : adjacencyList.get(node)) {
                int j = nodeIdToIndex.get(edge.getTarget().getId());
                adjacencyMatrix.setEntry(i, j, edge.getWeight());
            }
        }
        
        // Degree Matrix
        for (Node node : nodeList) {
            int i = nodeIdToIndex.get(node.getId());
            double degree = getDegree(node);
            degreeMatrix.setEntry(i, i, degree);
        }
        
        // Laplacian Matrix  (L = D - A)
        laplacianMatrix = degreeMatrix.subtract(adjacencyMatrix);
        
        matrixCacheValid = true;
    }


    // GET MATRICES
    public RealMatrix getAdjacencyMatrix() {
        if (!matrixCacheValid || adjacencyMatrix == null) {
            buildMatrices();
        }
        return adjacencyMatrix;
    }
    public RealMatrix getDegreeMatrix() {
        if (!matrixCacheValid || degreeMatrix == null) {
            buildMatrices();
        }
        return degreeMatrix;
    }
    public RealMatrix getLaplacianMatrix() {
        if (!matrixCacheValid || laplacianMatrix == null) {
            buildMatrices();
        }
        return laplacianMatrix;
    }
    public RealMatrix getCostMatrix() {
        if (!isConnected()){
            throw new IllegalStateException("Only available for fully connected graphs");
        }
        List<Node> candidates = getFacilityCandidates();
        List<Node> consumers = getCustomerNodes();
        int n = consumers.size();
        int m = candidates.size();

        RealMatrix cost = MatrixUtils.createRealMatrix(candidates.size(), consumers.size());
        GraphSearch gs = new GraphSearch(this);
        for (int i=0; i<m; i++){
            for (int j=0; j<n; j++){
                Node source = candidates.get(i);
                Node target = consumers.get(j);
                cost.setEntry(i, j, gs.searchBFS(source, target).getCost());
            }
        }
        return cost;
    }

    public int getMatrixIndexById(Integer nodeId) {
        return nodeIdToIndex.getOrDefault(nodeId, -1);
    }
    public int getMatrixIndex(Node node){
        Integer nodeId = node.getId();
        return getMatrixIndexById(nodeId);
    }

    public Map<Integer, Integer> getNodeIdToIndex() {
        return nodeIdToIndex;
    }
    // *-------------------------*
    // |  MATRIX METHODS END     |
    // *^^^^^^^^^^^^^^^^^^^^^^^^^*
    
    // Verify if a graph is connect using BFS
    public boolean isConnected() {
        if (nodeList.isEmpty()) return true;
        
        Node startNode = nodeList.iterator().next();
        Set<Node> reachable = new HashSet<>();
        Queue<Node> queue = new LinkedList<>();
        
        reachable.add(startNode);
        queue.add(startNode);
        
        while (!queue.isEmpty()) {
            Node current = queue.poll();
            for (Node neighbor : getNeighbors(current)) {
                if (!reachable.contains(neighbor)) {
                    reachable.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
        
        return reachable.size() == nodeList.size();
    }

    // Check if two nodes are connected
    public boolean areConnected(Node a, Node b){
        List<Edge> edges = adjacencyList.get(a);
        for (Edge edge : edges){
            if (edge.getTarget().equals(b)) {
                return true;
            }
        }
        return false;
    }

     public void clear(){
        nodeList.clear();
        edgeList.clear();
        adjacencyList.clear();
        System.out.println("NodeList length: "+nodeList.size());
        System.out.println("EdgeList length: "+edgeList.size());
    }

    
    public Double getDegree(Node node){
        if (node == null) return 0.0;
        
        List<Edge> edges = adjacencyList.get(node);
        if (edges==null){
            return 0.0;
        }
        Double degree = edges.stream().mapToDouble(e -> e.getWeight()).sum();
        return degree;
    }
    public Double getDegreeById(Integer nodeId){
        Node node = getNodeById(nodeId);
        return getDegree(node);
    }

    public boolean isWeighted(){
        for (Edge edge : edgeList){
            if (edge.getWeight()!=1.0){
                return true;
            }
        }
        return false;
    }
    

    @Override
    public String toString(){
        return "Adjacency List: "+adjacencyList;
    }

    public void printAdjacencyList(){
        System.out.println("[ADJACENCY LIST]: ");
        for (var entry : adjacencyList.entrySet()){
            System.out.println("Node: "+entry.getKey());
            List<Edge> edges = entry.getValue();
            for (Edge edge : edges){
                System.out.println("---- Edge: "+edge);
            }
        }
    }

    public Map<Node, List<Edge>> getAdjacencyList() { return adjacencyList; }
    public void setAdjacencyList(Map<Node, List<Edge>> adjacencyList) { this.adjacencyList = adjacencyList; }

}
