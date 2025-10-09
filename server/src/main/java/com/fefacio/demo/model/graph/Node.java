package com.fefacio.demo.model.graph;

import java.util.concurrent.atomic.AtomicInteger;

public class Node {
    private static final AtomicInteger count = new AtomicInteger(0); 
    private Integer id;
    private String label;
    private NodeType type;

   
    public Node(String label, NodeType type) {
        this.label = label;
        this.type = type;
        this.id = count.incrementAndGet();
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

    @Override
    public String toString() {
        return "Node [id=" + id + ", label=" + label + ", type=" + type + "]";
    }
}
