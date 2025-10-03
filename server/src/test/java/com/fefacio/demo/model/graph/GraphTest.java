package com.fefacio.demo.model.graph;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        Edge edge = new Edge(node1, node2);
        g.addNode(node1);
        g.addNode(node2);
        g.addEdge(edge);

        assertTrue(g.getAdjacencyList().get(node1).contains(edge));
        assertTrue(g.getAdjacencyList().get(node2).contains(edge));
        assertEquals(1, g.getAdjacencyList().get(node1).size());
        assertEquals(1, g.getAdjacencyList().get(node2).size());
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
}
