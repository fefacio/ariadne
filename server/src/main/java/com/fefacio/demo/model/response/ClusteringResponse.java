package com.fefacio.demo.model.response;

import java.util.Collections;
import java.util.Map;

public class ClusteringResponse {
    private boolean success;
    private Map<Integer, Integer> clusters;
    private double modularity;
    private long executionTimeMs;
    private String error;

    
    
    public ClusteringResponse(boolean success, Map<Integer, Integer> clusters, double modularity, long executionTimeMs,
            String error) {
        this.success = success;
        this.clusters = clusters;
        this.modularity = modularity;
        this.executionTimeMs = executionTimeMs;
        this.error = error;
    }
    public ClusteringResponse(String error) {
        this(false, Collections.emptyMap(), -1.0, -1L, error);
    }
    public ClusteringResponse(){
        this(false, Collections.emptyMap(), -1.0, -1L, null);
    }


    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public Map<Integer, Integer> getClusters() { return clusters; }
    public void setClusters(Map<Integer, Integer> clusters) { this.clusters = clusters; }

    public double getModularity() { return modularity; }
    public void setModularity(double modularity) { this.modularity = modularity; }

    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    

}
