package com.fefacio.demo.model.response;

import java.util.Map;
import java.util.Set;

public class PMedianResponse {
    private Integer p;
    private Set<Integer> facilities;
    private Double cost;
    private Map<Integer, Integer> assignments;
    private String error;
    
    
    public PMedianResponse(Integer p, Set<Integer> facilities,  Double cost, Map<Integer, Integer> assignments, String error) {
        this.p = p;
        this.facilities = facilities;
        this.cost = cost;
        this.assignments = assignments;
        this.error = error;
    }
    public PMedianResponse(String error){
        this(null, null, -1.0, null, error);
    }
    public PMedianResponse(Integer p){
        this(p, null, -1.0, null, null);
    }

    
    public Integer getP() { return p; }
    public void setP(Integer p) { this.p = p; }

    public Set<Integer> getFacilities() { return facilities; }
    public void setFacilities(Set<Integer> facilities) { this.facilities = facilities; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public Map<Integer, Integer> getAssignments() { return assignments; }
    public void setAssignments(Map<Integer, Integer> assignments) { this.assignments = assignments; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

  

    
}
