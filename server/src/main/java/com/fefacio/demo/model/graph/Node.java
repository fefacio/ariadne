package com.fefacio.demo.model.graph;

import java.util.concurrent.atomic.AtomicInteger;

public class Node {
    private static final AtomicInteger count = new AtomicInteger(0); 
    private Integer id;
    private String label;
    private NodeType type;
    private Double demand;

    
    public Node(String label, NodeType type, Double demand){
        this.label = label;
        this.type = type;
        this.demand = demand;
        this.id = count.incrementAndGet();
    }
    public Node(String label, NodeType type) {
        this(label, type, null);
    }
    public Node(NodeType type) {
        this("", type);
    }
    public Node() {
        this("", NodeType.NORMAL);
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public NodeType getType() { return type; }
    public void setType(NodeType type) { this.type = type; }

    public Double getDemand() { return demand; }
    public void setDemand(Double demand) { this.demand = demand; }

    @Override
    public String toString() {
        return "Node [id=" + id + ", label=" + label + ", type=" + type + ", demand=" + demand + "]";
    }
}
