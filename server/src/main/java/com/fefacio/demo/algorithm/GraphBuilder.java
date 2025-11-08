package com.fefacio.demo.algorithm;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;

import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;

public class GraphBuilder {
    public static Graph completeGraph(int k){
        Graph g = new Graph();
        List<Node> nodes = new ArrayList<>();
        for (int i=0; i<k; i++){
            Node node = new Node();
            g.addNode(node);
            nodes.add(node);
        }

        for (int i=0; i<k; i++){
            for (int j=i+1; j<k; j++){
                g.addUndirectedEdge(nodes.get(i), nodes.get(j), 1.0);
            }
        }
        
        return g;
    }

}
