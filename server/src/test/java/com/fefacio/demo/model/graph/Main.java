package com.fefacio.demo.model.graph;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Arrays;
import java.util.Map;

import org.apache.commons.math3.linear.RealMatrix;

import com.fefacio.demo.algorithm.GraphBuilder;
import com.fefacio.demo.algorithm.GraphCentrality;
import com.fefacio.demo.algorithm.GraphClustering;

public class Main {
    public static void main(String[] args) {
		// System.out.println("Hello");
        // Graph graph = new Graph();
        // Node node1 = new Node(NodeType.NORMAL);
        // Node node2 = new Node(NodeType.NORMAL);
        // Node node3 = new Node(NodeType.NORMAL);
        
        // graph.addNode(node1);
        // graph.addNode(node2);
        // graph.addNode(node3);
        
        // graph.addUndirectedEdge(new Edge(node1, node2, 1.0));
        // graph.addUndirectedEdge(new Edge(node2, node3, 2.0));
        // graph.addUndirectedEdge(new Edge(node3, node1, 3.0));
        
        // RealMatrix A = graph.getAdjacencyMatrix();
        // int idx1 = graph.getMatrixIndex(node1);
        // int idx2 = graph.getMatrixIndex(node2);
        // int idx3 = graph.getMatrixIndex(node3);

        // System.out.println("matrix: AAAAAAAAAAAA"+Arrays.deepToString(A.getData()));
        // graph.printAdjacencyList();
        // System.out.println(graph.getNodeIdToIndex());
        // System.out.println("entry: "+A.getEntry(idx1, idx2));

        //testGraphClustering();
        //test2();
        //testCompleteGraph(4);
        //testDegreeCentralityEmptyGraph();
        //testDisconnectedGraph();
        testCostMatrix();
	}

    public static void test2(){
        System.out.println("TESTE 2");
        Graph g = new Graph();
        Node node1 = new Node();
        Node node2 = new Node();
        g.addNode(node1);
        g.addNode(node2);
        g.addUndirectedEdge(node1, node2, 1.0);
        g.printAdjacencyList();
    }

    public static void testGraphClustering(){
        System.out.println("Hello");
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        Node node4 = new Node(NodeType.NORMAL);
        Node node5 = new Node(NodeType.NORMAL);
        Node node6 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        graph.addNode(node4);
        graph.addNode(node5);
        graph.addNode(node6);

        graph.addUndirectedEdge(node1, node2, 1.0);
        graph.addUndirectedEdge(node2, node3, 1.0);
        graph.addUndirectedEdge(node3, node1, 1.0);

        graph.addUndirectedEdge(node4, node5, 1.0);
        graph.addUndirectedEdge(node5, node6, 1.0);
        graph.addUndirectedEdge(node6, node4, 1.0);

        graph.addUndirectedEdge(node3, node6, 1.0);

        GraphClustering clustering = new GraphClustering(graph);
        Map<Integer, Integer> clusters = clustering.spectralClustering(2, 10000, 10); 
        System.out.println("CLUSTERS: "+clusters);
        double quality = clustering.calculateModularity(clusters);
        System.out.println("Quality: "+quality);

    }

    public static void testDisconnectedGraph(){
        Graph graph = new Graph();

        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(c, d, 1.0);
        graph.printAdjacencyList();
        GraphCentrality centrality = new GraphCentrality(graph);
        
        Map<Integer, Double> degree = centrality.degreeCentrality();
        Map<Integer, Double> closeness = centrality.closenessCentrality();
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();

        System.out.println("Degree A: "+ degree.get(a.getId()));
        System.out.println("Closeness A: "+ closeness.get(a.getId()));
        System.out.println("Betweenness A: "+ betweenness.get(a.getId()));
    }

    public static void testDegreeCentralityEmptyGraph() {
        Graph graph = new Graph();
        Node a = new Node(NodeType.NORMAL);
        graph.addNode(a);
        
        GraphCentrality centrality = new GraphCentrality(graph);
        Map<Integer, Double> degree = centrality.degreeCentrality();
        
        System.out.println("degree a"+degree.get(a.getId()));
    }

    public static void testCompleteGraph(int k){
        Graph g = GraphBuilder.completeGraph(k);
        g.printAdjacencyList();
    }

    public static void testCostMatrix(){
        Graph graph = new Graph();

        Node a = new Node(NodeType.CONSUMER);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.CONSUMER);
        Node e = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        graph.addNode(e);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(b, c, 1.0);
        graph.addUndirectedEdge(c, a, 1.0);
        graph.addUndirectedEdge(d, c, 1.0);
        graph.addUndirectedEdge(b, e, 1.0);

        RealMatrix cost = graph.getCostMatrix();
        for (int i=0; i<cost.getRowDimension(); i++){
            for (int j=0; j<cost.getColumnDimension(); j++){
                System.out.printf("%f ",cost.getEntry(i, j));
            }
            System.out.println();
        }

    }
    
}
