package com.fefacio.demo.model.request;

import jakarta.validation.constraints.NotNull;

public class EdgeRequest {
    @NotNull
    private Integer sourceId;
    @NotNull
    private Integer targetId;
    private Double weight;

    public Integer getSourceId() { return sourceId; }
    public void setSourceId(Integer sourceId) { this.sourceId = sourceId; }

    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

}
