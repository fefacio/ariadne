package com.fefacio.demo.model.response;

public class GraphDataResponse {
    private Integer nodeCount;
    private Integer edgeCount;

    
    public GraphDataResponse(Integer nodeCount, Integer edgeCount) {
        this.nodeCount = nodeCount;
        this.edgeCount = edgeCount;
    }
    public GraphDataResponse(){
        this(0, 0);
    }

    public Integer getNodeCount() { return nodeCount; }
    public void setNodeCount(Integer nodeCount) { this.nodeCount = nodeCount; }

    public Integer getEdgeCount() { return edgeCount; }
    public void setEdgeCount(Integer edgeCount) { this.edgeCount = edgeCount; }

}
