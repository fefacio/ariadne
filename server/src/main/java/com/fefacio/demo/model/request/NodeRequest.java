package com.fefacio.demo.model.request;

public class NodeRequest {
    private String type;
    private Double demand;
    
    public NodeRequest(String type, Double demand) {
        this.type = type;
        this.demand = demand;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getDemand() { return demand; }
    public void setDemand(Double demand) { this.demand = demand; }    
}