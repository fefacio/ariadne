package com.fefacio.demo.model.response;

import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.Node;

public class NodeResponse {
    private Integer id;
    private String type;
    private Double demand;


    public NodeResponse(Integer id, String type, Double demand) {
        this.id = id;
        this.type = type;
        this.demand = demand;
    }

    public static NodeResponse from(Node node) {
        return new NodeResponse(
            node.getId(),
            node.getType().toString(),
            node.getDemand()
        );
    }
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getDemand() { return demand; }
    public void setDemand(Double demand) { this.demand = demand; }

}
