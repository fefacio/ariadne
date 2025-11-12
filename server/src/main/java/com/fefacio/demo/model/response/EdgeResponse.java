package com.fefacio.demo.model.response;

import com.fefacio.demo.model.graph.Edge;

public class EdgeResponse {
    private Integer id;
    private Integer sourceId;
    private Integer targetId;
    private Double weight;
    
    public EdgeResponse(Integer id, Integer sourceId, Integer targetId, Double weight) {
        this.id = id;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.weight = weight;
    }

    public static EdgeResponse from(Edge edge) {
        return new EdgeResponse(
            edge.getId(),
            edge.getSource().getId(),
            edge.getTarget().getId(),
            edge.getWeight()
        );
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getSourceId() { return sourceId; }
    public void setSourceId(Integer sourceId) { this.sourceId = sourceId; }
    
    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
}
