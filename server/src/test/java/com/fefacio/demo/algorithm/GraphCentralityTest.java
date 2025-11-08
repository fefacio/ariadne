package com.fefacio.demo.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.NodeType;

import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

public class GraphCentralityTest {
    
    private Graph graph;
    private GraphCentrality centrality;
    
    @BeforeEach
    void setUp() {
        graph = new Graph();
    }
    
    // ==========================================
    // DEGREE CENTRALITY TESTS
    // ==========================================
    
    @Test
    void testDegreeCentralityStarGraph() {
        /*
         *     B  C  D
         *      \ | /
         *       \|/
         *        A 
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(a, c, 1.0);
        graph.addUndirectedEdge(a, d, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> degree = centrality.degreeCentrality();
        
        // A = 3/(4-1) = 1.0 | B,C,D = 1/(4-1) = 0.333
        assertEquals(1.0, degree.get(a.getId()), 0.001);
        assertEquals(0.333, degree.get(b.getId()), 0.001);
        assertEquals(0.333, degree.get(c.getId()), 0.001);
        assertEquals(0.333, degree.get(d.getId()), 0.001);
    }
    
    @Test
    void testDegreeCentralityLineGraph() {
        /*
         * A --- B --- C --- D
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);


        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(b, c, 1.0);
        graph.addUndirectedEdge(c, d, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> degree = centrality.degreeCentrality();
        
        // A,D = 1/(4-1) = 0.333 | B,C = 2/(4-1) = 0.667
        assertEquals(0.333, degree.get(a.getId()), 0.001);
        assertEquals(0.667, degree.get(b.getId()), 0.001);
        assertEquals(0.667, degree.get(c.getId()), 0.001);
        assertEquals(0.333, degree.get(d.getId()), 0.001);
    }
    
    @Test
    void testDegreeCentralityEmptyGraph() {
        Node a = new Node(NodeType.NORMAL);
        graph.addNode(a);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> degree = centrality.degreeCentrality();
        
        assertEquals(0.0, degree.get(a.getId()), 0.001);
    }
    
    // ==========================================
    // CLOSENESS CENTRALITY TESTS
    // ==========================================
    
    @Test
    void testClosenessCentralityStarGraph() {
        /*
         *     B  C  D
         *      \ | /
         *       \|/
         *        A  
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(a, c, 1.0);
        graph.addUndirectedEdge(a, d, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> closeness = centrality.closenessCentrality();
        
        // A: dist B,C,D = 1,1,1 →  sum=3 →  closeness = 3/3 = 1.0
        // B: dist A=1, C=2, D=2 →  sum=5 →  closeness = 3/5 = 0.6
        assertTrue(closeness.get(a.getId()) > closeness.get(b.getId()));
        assertTrue(closeness.get(a.getId()) > closeness.get(c.getId()));
        assertTrue(closeness.get(a.getId()) > closeness.get(d.getId()));

        assertEquals(1.0, closeness.get(a.getId()), 0.001);
        assertEquals(0.6, closeness.get(b.getId()), 0.001);
    }
    
    @Test
    void testClosenessCentralityLineGraph() {
        /*
         * A --- B --- C --- D
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(b, c, 1.0);
        graph.addUndirectedEdge(c, d, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> closeness = centrality.closenessCentrality();
        
        // B: dist A=1, C=1, D=2 →  sum=4 →  closeness = 3/4 = 0.75
        // A: dist B=1, C=2, D=3 →  sum=6 →  closeness = 3/6 = 0.5
        assertTrue(closeness.get(b.getId()) > closeness.get(a.getId()));
        assertTrue(closeness.get(c.getId()) > closeness.get(d.getId()));
        
        assertEquals(0.5, closeness.get(a.getId()), 0.001);
        assertEquals(0.75, closeness.get(b.getId()), 0.001);
        // B e C must have the same closeness
        assertEquals(closeness.get(b.getId()), closeness.get(c.getId()), 0.001);
    }
    
    @Test
    void testClosenessCentralityWeightedGraph() {
        /*
         *     1      10
         * A ─── B ────── C
         * 
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(b, c, 10.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> closeness = centrality.closenessCentrality();
        
        // A: dist B=1, C=11 →  sum=12 →  closeness = 2/12 = 0.167
        // B: dist A=1, C=10 →  sum=11 →  closeness = 2/11 = 0.182
        // C: dist B=10, A=11 →  sum=21 →  closeness = 2/21 = 0.095
        
        assertTrue(closeness.get(b.getId()) > closeness.get(a.getId()));
        assertTrue(closeness.get(a.getId()) > closeness.get(c.getId()));

        assertEquals(0.167, closeness.get(a.getId()), 0.001);
        assertEquals(0.182, closeness.get(b.getId()), 0.001);
    }
    
    // ==========================================
    // BETWEENNESS CENTRALITY TESTS
    // ==========================================
    
    @Test
    void testBetweennessCentralityStarGraph() {
        /*
         *     B  C  D
         *      \ | /
         *       \|/
         *        A  
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(a, c, 1.0);
        graph.addUndirectedEdge(a, d, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();
        
        // A in all shortest paths (B-C, C-D, B-D) -> betweenness = 1.0
        // B, C, D not in any shortest path
        assertEquals(1.0, betweenness.get(a.getId()), 0.001);
        assertEquals(0.0, betweenness.get(b.getId()), 0.001);
        assertEquals(0.0, betweenness.get(c.getId()), 0.001);
        assertEquals(0.0, betweenness.get(d.getId()), 0.001);
    }
    
    @Test
    void testBetweennessCentralityLineGraph() {
        /*
         * A --- B --- C --- D
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(b, c, 1.0);
        graph.addUndirectedEdge(c, d, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();
        
        // Paths = {A-B, A-C, A-D, B-C, B-D, C-D}
        // B in: {A-C, A-D}
        // C in: {A-D, B-D}
        // A,D = {}
        // betweenness B = 2/((4-1)(4-2)/2) = 2/3
        assertTrue(betweenness.get(b.getId()) > betweenness.get(a.getId()));
        assertTrue(betweenness.get(c.getId()) > betweenness.get(d.getId()));

        assertEquals(0.0, betweenness.get(a.getId()), 0.001);
        assertEquals(0.0, betweenness.get(d.getId()), 0.001);

        assertEquals(0.667, betweenness.get(b.getId()), 0.001);
        assertEquals(0.667, betweenness.get(c.getId()), 0.001);
    }
    
    @Test
    void testBetweennessCentrality_BridgeNode() {
        /*
         * A --- B --- C --- D --- E
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        Node e = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        graph.addNode(e);
        
        graph.addUndirectedEdge(a, b, 1.0);
        graph.addUndirectedEdge(b, c, 1.0);
        graph.addUndirectedEdge(c, d, 1.0);
        graph.addUndirectedEdge(d, e, 1.0);
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();
        
        // C = {A-D, A-E, B-D, B-E}
        // betweenness C = 4/((5-1)(5-2)/2)=4/6=2/3=0.667
        assertTrue(betweenness.get(c.getId()) > betweenness.get(b.getId()));
        assertTrue(betweenness.get(c.getId()) > betweenness.get(d.getId()));
        
        assertEquals(0.0, betweenness.get(a.getId()), 0.001);
        assertEquals(0.0, betweenness.get(e.getId()), 0.001);

        assertEquals(0.667, betweenness.get(c.getId()), 0.001);
    }
    
    @Test
    void testBetweennessCentralityMultiplePaths() {
        /*
         *        2
         *    A ──── B
         *    │ \    │
         *   5│  \3  │1
         *    │   \  │
         *    C ─── D
         *       4
         * 
         * D is critical point
         */
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        Node c = new Node(NodeType.NORMAL);
        Node d = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addNode(c);
        graph.addNode(d);
        
        graph.addUndirectedEdge(a, b, 2.0);
        graph.addUndirectedEdge(a, c, 5.0);
        graph.addUndirectedEdge(a, d, 3.0);
        graph.addUndirectedEdge(b, d, 1.0);
        graph.addUndirectedEdge(c, d, 4.0);
        
        centrality = new GraphCentrality(graph);
        
        // Testar com BFS (não ponderado)
        Map<Integer, Double> betweennessUnweighted = centrality.betweennessCentrality(false);
        
        // Testar com Dijkstra (ponderado)
        Map<Integer, Double> betweennessWeighted = centrality.betweennessCentrality(true);
        
        // D deve ter alto betweenness em ambos os casos
        assertTrue(betweennessWeighted.get(d.getId()) > 0, 
                   "D deve ter betweenness positivo (é ponte)");
        
        // Versão ponderada considera os pesos
        assertNotEquals(betweennessUnweighted.get(b.getId()), 
                       betweennessWeighted.get(b.getId()), 
                       0.001,
                       "Betweenness ponderado deve diferir do não ponderado");

          assertEquals(0.0, betweennessWeighted.get(a.getId()), 0.001);
          assertEquals(0.166, betweennessWeighted.get(b.getId()), 0.001);
          assertEquals(0.0, betweennessWeighted.get(c.getId()), 0.001);
          assertEquals(0.333, betweennessWeighted.get(d.getId()), 0.001);
    }
    
    @Test
    void testBetweennessCentralityCompleteGraph() {
        /*
         * K4:
         * Always a direct path between all nodes
         */
        Graph graph = GraphBuilder.completeGraph(4);
        List<Node> nodes = graph.getNodes();
        
        centrality = new GraphCentrality(graph);
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();
        
        // A,B,C,D betweenness = 0
        for (Node node : nodes){
            assertEquals(0.0, betweenness.get(node.getId()), 0.001);
        }
    }
    
    // ==========================================
    // EDGE CASES
    // ==========================================
    
    @Test
    void testCentralityTwoNodes() {
        Node a = new Node(NodeType.NORMAL);
        Node b = new Node(NodeType.NORMAL);
        
        graph.addNode(a);
        graph.addNode(b);
        graph.addUndirectedEdge(a, b, 1.0);
        
        centrality = new GraphCentrality(graph);
        
        Map<Integer, Double> degree = centrality.degreeCentrality();
        Map<Integer, Double> closeness = centrality.closenessCentrality();
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();
        
        // degree A,B = 1
        assertEquals(1.0, degree.get(a.getId()), 0.001);
        assertEquals(1.0, degree.get(b.getId()), 0.001);
        
        // A: dist B=1 →  sum=1 →  closeness = 1/1 = 1.0
        // B: dist A=1 →  sum=1 →  closeness = 1/1 = 1.0
        assertTrue(closeness.get(a.getId()) > 0);
        assertTrue(closeness.get(b.getId()) > 0);
        assertEquals(1.0, closeness.get(a.getId()), 0.001);
        assertEquals(1.0, closeness.get(a.getId()), 0.001);
        
        // A and B are always source or destination
        assertEquals(0.0, betweenness.get(a.getId()), 0.001);
        assertEquals(0.0, betweenness.get(b.getId()), 0.001);
    }
    
    @Test
    void testCentralityDisconnectedGraph() {
        /*
         * Dois componentes separados:
         * A --- B    C --- D
         */
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
        
        centrality = new GraphCentrality(graph);
        
        Map<Integer, Double> degree = centrality.degreeCentrality();
        Map<Integer, Double> closeness = centrality.closenessCentrality();
        Map<Integer, Double> betweenness = centrality.betweennessCentrality();
        
        // Degree considera apenas vizinhos diretos
        assertNotNull(degree.get(a.getId()));
        assertNotNull(degree.get(c.getId()));
        
        // Closeness só considera nós alcançáveis
        assertNotNull(closeness.get(a.getId()));
        
        // Betweenness dentro de cada componente
        assertNotNull(betweenness.get(a.getId()));
    }
}