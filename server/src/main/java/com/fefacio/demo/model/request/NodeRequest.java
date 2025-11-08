package com.fefacio.demo.model.request;

public class NodeRequest {
    private String label;
    private String type;
    private Double demand;
    
    public NodeRequest(String label, String type, Double demand) {
        this.label = label;
        this.type = type;
        this.demand = demand;
    }
    
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getDemand() { return demand; }
    public void setDemand(Double demand) { this.demand = demand; }    
}