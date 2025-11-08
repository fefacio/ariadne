package com.fefacio.demo.model.request;

public class SearchRequest {
    private String method;
    private Integer sourceId;
    private Integer targetId;
    
    public SearchRequest() {}
    public SearchRequest(String method, Integer sourceId, Integer targetId) {
        this.method = method;
        this.sourceId = sourceId;
        this.targetId = targetId;
    }
    
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    
    public Integer getSourceId() { return sourceId; }
    public void setSourceId(Integer sourceId) { this.sourceId = sourceId; }
    
    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }
}