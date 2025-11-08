package com.fefacio.demo.model.graph;

import java.util.concurrent.atomic.AtomicInteger;

public class Edge {
    private static final AtomicInteger count = new AtomicInteger(0); 
    private Integer id;
    private Node source;
    private Node target;
    private Double weight;
    
    public Edge(Node source, Node target, Double weight){
        this.source = source;
        this.target = target;
        this.weight = weight;
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

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((source == null) ? 0 : source.hashCode());
        result = prime * result + ((target == null) ? 0 : target.hashCode());
        result = prime * result + ((weight == null) ? 0 : weight.hashCode());
        return result;
    }
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Edge other = (Edge) obj;
        if (source == null) {
            if (other.source != null)
                return false;
        } else if (!source.equals(other.source))
            return false;
        if (target == null) {
            if (other.target != null)
                return false;
        } else if (!target.equals(other.target))
            return false;
        if (weight == null) {
            if (other.weight != null)
                return false;
        } else if (!weight.equals(other.weight))
            return false;
        return true;
    }
    @Override
    public String toString() {
        return "Edge [id=" + id + " source=" + source + ", target=" + target + ", weight=" + weight + "]";
    }

    
    
}
