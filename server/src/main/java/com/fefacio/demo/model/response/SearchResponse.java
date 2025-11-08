package com.fefacio.demo.model.response;

import java.util.ArrayList;
import java.util.List;

import com.fefacio.demo.model.graph.Node;

public class SearchResponse {
    private String method;
    private Integer sourceId;
    private Integer targetId;
    private boolean found;
    private double cost;
    private List<Node> path;
    
    public SearchResponse(String method, Integer sourceId, Integer targetId, boolean found, double cost, List<Node> path) {
        this.method = method;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.found = found;
        this.cost = cost;
        this.path = path;
    }
    public SearchResponse(String method, Integer sourceId, Integer targetId) {
        this(method, sourceId, targetId, false, -1, null);
    }
    
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public Integer getSourceId() { return sourceId; }
    public void setSourceId(Integer sourceId) { this.sourceId = sourceId; }

    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }

    public boolean isFound() { return found; }
    public void setFound(boolean found) { this.found = found; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }

    public List<Node> getPath() { return path; }
    public void setPath(List<Node> path) { this.path = path; }
    

    @Override
    public String toString() {
        if (!found) {
            return "Path not found";
        }
        return String.format("Found: cost=%.2f, length=%d, path=%s", 
                            cost, path.size());
    }
}