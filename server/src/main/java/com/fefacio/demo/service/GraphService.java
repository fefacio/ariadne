package com.fefacio.demo.service;

import org.springframework.stereotype.Service;

import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.graph.NodeType;
import com.fefacio.demo.model.request.EdgeRequest;
import com.fefacio.demo.model.request.NodeRequest;

@Service
public class GraphService {
    private Graph graph = new Graph();
    
    public Node getNode(Integer nodeId){
        return graph.getNodeById(nodeId);
    }

    public Integer addNode(NodeRequest nodeRequest){
        NodeType nodeType = NodeType.NORMAL;
        if (nodeRequest.getType() != null) {
            try {
                nodeType = NodeType.valueOf(nodeRequest.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid NodeType"+e);
            }
        }
        
        Node node;
        if(nodeRequest.getLabel()!=null){
            node = new Node(nodeRequest.getLabel(), nodeType);
        } else  {
            node = new Node();
        }

        graph.addNode(node);
        return node.getId();
    }

    public boolean removeNode(Integer nodeId){
        return graph.removeNodeById(nodeId);
    }

    public Edge getEdge(Integer edgeId){
        return graph.getEdgeById(edgeId);
    }

    public Integer addEdge(EdgeRequest edgeRequest){
        Integer node1Id = edgeRequest.getSourceId();
        Node node1 = graph.getNodeById(node1Id);

        Integer node2Id = edgeRequest.getTargetId();
        Node node2 = graph.getNodeById(node2Id);

        Edge edge;
        if (edgeRequest.getWeight()!=null){
            edge = new Edge(node1, node2, edgeRequest.getWeight());
        } else {
            edge = new Edge(node1, node2);
        }
        graph.addEdge(edge);

        return edge.getId();
    }

    public boolean removeEdge(Integer edgeId){
        return graph.removeEdgeById(edgeId);
    }

    public void clearGraph(){
        graph.clear();
    }
}
