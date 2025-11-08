package com.fefacio.demo.model.response;

public class NodeResponse {
    private Integer id;
    private String label;
    private String type;
    private Double demand;
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getDemand() { return demand; }
    public void setDemand(Double demand) { this.demand = demand; }

}
