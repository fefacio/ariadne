package com.fefacio.demo.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.platform.commons.annotation.Testable;

import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.graph.NodeType;
import com.fefacio.demo.model.response.GraphDataResponse;
import com.fefacio.demo.model.response.SearchResponse;

@Testable
public class GraphSearchTests {
    @Test
    void testDjikstraSimpleGraph(){
        Graph graph = new Graph();
        Node node1 = new Node(NodeType.NORMAL);
        Node node2 = new Node(NodeType.NORMAL);
        Node node3 = new Node(NodeType.NORMAL);
        
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        graph.addUndirectedEdge(node1, node2, 2.0);
        graph.addUndirectedEdge(node2, node3, 1.0);
        graph.addUndirectedEdge(node3, node1, 4.0);

        GraphSearch gs = new GraphSearch(graph);
        SearchResponse dijkstra = gs.searchDijkstra(node1, node3);
        assertEquals(3.0, dijkstra.getCost(), 0.001);
        List<Node> expectedPath = new ArrayList<>(List.of(node1, node2, node3));
        List<Node> actualPath = dijkstra.getPath(); 
        assertEquals(expectedPath, actualPath);
    }
    
}
