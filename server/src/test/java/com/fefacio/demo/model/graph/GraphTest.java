package com.fefacio.demo.model.graph;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;

import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.annotation.Testable;

@Testable
public class GraphTest {

    @Test
    void testAddNodeAdjacencyList() {
        Graph g = new Graph();
        Node node = new Node();
        g.addNode(node);

        assertTrue(g.getAdjacencyList().containsKey(node));
        assertEquals(0, g.getAdjacencyList().get(node).size());
    }

    @Test
    void testAddEdgeDifferentNodesAdjacencyList() {
        Graph g = new Graph();
        Node node1 = new Node();
        Node node2 = new Node();
        g.addNode(node1);
        g.addNode(node2);
        g.addUndirectedEdge(node1, node2, 1.0);

        assertTrue(g.getAdjacencyList().get(node1).contains(new Edge(node1, node2)));
        assertTrue(g.getAdjacencyList().get(node2).contains(new Edge(node2, node1)));
        assertEquals(1, g.getAdjacencyList().get(node1).size());
        assertEquals(1, g.getAdjacencyList().get(node2).size());

        assertEquals(node1, g.getAdjacencyList().get(node1).get(0).getSource());
        assertEquals(node2, g.getAdjacencyList().get(node1).get(0).getTarget());
        assertEquals(node2, g.getAdjacencyList().get(node2).get(0).getSource());
        assertEquals(node1, g.getAdjacencyList().get(node2).get(0).getTarget());
    }
    
    @Test
    void testAddSameNodeMultipleTimesAdjacencyListDoesNotReinitialize() {
        Graph g = new Graph();
        Node node1 = new Node();
        Node node2 = new Node();
        Edge edge = new Edge(node1, node2);
        g.addNode(node1);
        g.addNode(node2);
        g.addEdge(edge);
        
        assertThrows(IllegalStateException.class, () -> {g.addNode(node1);} );
    }

    @Test
    void testNodesDegreesSimpleGraph() {
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        graph.addUndirectedEdge(node1, node2, 1.0);
        graph.addUndirectedEdge(node2, node3, 1.0);
        graph.addUndirectedEdge(node3, node1, 1.0);

        assertEquals(graph.getDegree(node1), 2.0, 0.001);
        assertEquals(graph.getDegree(node2), 2.0, 0.001);
        assertEquals(graph.getDegree(node3), 2.0, 0.001);
    }

    @Test
    void testNodesDegreesSimpleGraphWeighted() {
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        graph.addUndirectedEdge(node1, node2, 1.0);
        graph.addUndirectedEdge(node2, node3, 2.0);
        graph.addUndirectedEdge(node3, node1, 3.0);

        assertEquals(graph.getDegree(node1), 4.0, 0.001);
        assertEquals(graph.getDegree(node2), 3.0, 0.001);
        assertEquals(graph.getDegree(node3), 5.0, 0.001);
    }

    @Test
    void testAdjacencyMatrixSimpleGraph() {
        //   Graph Undirected:
        //   1 → 2 (1.0)
        //   2 → 3 (2.0)
        //   3 → 1 (3.0)
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        graph.addUndirectedEdge(node1, node2, 1.0);
        graph.addUndirectedEdge(node2, node3, 2.0);
        graph.addUndirectedEdge(node3, node1, 3.0);
        
        RealMatrix A = graph.getAdjacencyMatrix();
        
        // Validate dimensions
        assertEquals(3, A.getRowDimension());
        assertEquals(3, A.getColumnDimension());
        
        int idx1 = graph.getMatrixIndex(node1);
        int idx2 = graph.getMatrixIndex(node2);
        int idx3 = graph.getMatrixIndex(node3);

        
        // 1 → 2
        assertEquals(1.0, A.getEntry(idx1, idx2));
        // 2 → 3
        assertEquals(2.0, A.getEntry(idx2, idx3));
        // 1 → 3
        assertEquals(3.0, A.getEntry(idx1, idx3));
        
        // // Diagonal
        assertEquals(0.0, A.getEntry(idx1, idx1), 0.001);
        assertEquals(0.0, A.getEntry(idx2, idx2), 0.001);
        assertEquals(0.0, A.getEntry(idx3, idx3), 0.001);

        // Entire Matrix
        RealMatrix expected = MatrixUtils.createRealMatrix(new double[][] {
            {0.0, 1.0, 3.0},
            {1.0, 0.0, 2.0},
            {3.0, 2.0, 0.0}
        });
        for (int i = 0; i < expected.getRowDimension(); i++) {
            for (int j = 0; j < expected.getColumnDimension(); j++) {
                assertEquals(expected.getEntry(i, j), A.getEntry(i, j), 0.001,
                    String.format("Mismatch at (%d, %d)", i, j));
            }
        }
    }

    @Test
    void testDegreeMatrixSimpleGraph() {
        //   Graph Undirected:
        //   1 → 2 (1.0)
        //   2 → 3 (2.0)
        //   3 → 1 (3.0)
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        graph.addUndirectedEdge(node1, node2, 1.0);
        graph.addUndirectedEdge(node2, node3, 2.0);
        graph.addUndirectedEdge(node3, node1, 3.0);
        
        RealMatrix D = graph.getDegreeMatrix();
        
        int idx1 = graph.getMatrixIndex(node1);
        int idx2 = graph.getMatrixIndex(node2);
        int idx3 = graph.getMatrixIndex(node3);
        
        // Diagonal
        assertEquals(4.0, D.getEntry(idx1, idx1), 0.001); 
        assertEquals(3.0, D.getEntry(idx2, idx2), 0.001);
        assertEquals(5.0, D.getEntry(idx3, idx3), 0.001);
        
        // Outisde diagonal
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (i != j) {
                    assertEquals(0.0, D.getEntry(i, j), 0.001);
                }
            }
        }
    }

    void testLaplacianMatrixSimpleGraph() {
        //   Graph Undirected:
        //   1 → 2 (1.0)
        //   2 → 3 (2.0)
        //   3 → 1 (3.0)
        
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        graph.addUndirectedEdge(node1, node2, 1.0);
        graph.addUndirectedEdge(node2, node3, 2.0);
        graph.addUndirectedEdge(node3, node1, 3.0);
        
        RealMatrix A = graph.getAdjacencyMatrix();
        RealMatrix D = graph.getDegreeMatrix();
        RealMatrix L = graph.getLaplacianMatrix();
        
        // L = D - A
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                double expected = D.getEntry(i, j) - A.getEntry(i, j);
                assertEquals(expected, L.getEntry(i, j), 0.001);
            }
        }
        
        // Sum of each line equals 0 
        for (int i = 0; i < 3; i++) {
            double rowSum = 0.0;
            for (int j = 0; j < 3; j++) {
                rowSum += L.getEntry(i, j);
            }
            assertEquals(0.0, rowSum, 0.001);
        }
    }

}
