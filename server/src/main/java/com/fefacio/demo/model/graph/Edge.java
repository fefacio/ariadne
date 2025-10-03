package com.fefacio.demo.model.graph;

import java.util.concurrent.atomic.AtomicInteger;

public class Edge {
    private static final AtomicInteger count = new AtomicInteger(0); 
    private Integer id;
    private Node source;
    private Node target;
    private Double weigth;
    
    public Edge(Node source, Node target, Double weigth){
        this.source = source;
        this.target = target;
        this.weigth = weigth;
        this.id = count.incrementAndGet();
    }
    public Edge(Node source, Node target){
        this(source, target, 1.0);
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Node getSource() { return source; }
    public void setSource(Node source) { this.source = source; }

    public Node getTarget() { return target; }
    public void setTarget(Node target) { this.target = target; }

    public Double getWeigth() { return weigth; }
    public void setWeigth(Double weigth) { this.weigth = weigth; }

    @Override
    public String toString() {
        return "Edge [id=" + id + " source=" + source + ", target=" + target + ", weigth=" + weigth + "]";
    }

    
    
}
