package com.fefacio.demo.model.request;

import jakarta.validation.constraints.NotNull;

public class ClusteringRequest {
    @NotNull
    private Integer k;
    private Integer maxIterations;
    private Integer maxTrials;

    public Integer getK() { return k; }
    public void setK(Integer k) { this.k = k; }

    public Integer getMaxIterations() { return maxIterations; }
    public void setMaxIterations(Integer maxIterations) { this.maxIterations = maxIterations; }

    public Integer getMaxTrials() { return maxTrials; }
    public void setMaxTrials(Integer maxTrials) { this.maxTrials = maxTrials; }
}
