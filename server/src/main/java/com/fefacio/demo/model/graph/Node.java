package com.fefacio.demo.model.graph;

import java.util.concurrent.atomic.AtomicInteger;

public class Node {
    private static final AtomicInteger count = new AtomicInteger(0); 
    private Integer id;
    private NodeType type;
    private Double demand;

    public Node(NodeType type, Double demand){
        this.type = type;
        this.demand = demand;
        this.id = count.incrementAndGet();
    }
    public Node(NodeType type) {
        this(type, null);
    }
    public Node() {
        this(NodeType.NORMAL);
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public NodeType getType() { return type; }
    public void setType(NodeType type) { this.type = type; }

    public Double getDemand() { return demand; }
    public void setDemand(Double demand) { this.demand = demand; }

    @Override
    public String toString() {
        return "Node [id=" + id + ", type=" + type + ", demand=" + demand + "]";
    }
}
