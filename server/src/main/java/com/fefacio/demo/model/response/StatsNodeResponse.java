package com.fefacio.demo.model.response;

import java.util.List;

public class StatsNodeResponse {
    private Integer id;
    private String label;
    private String type;

    private Double degree;
    private Double normalizedDegree;
    private List<Integer> neighborIds;

    
    private Double betweennessCentrality;
    private Double closenessCentrality;

    private Double averagePathLength;
    private Double clusteringCoefficient;
    private Double eccentricity;
    

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    
    public Double getDegree() { return degree; }
    public void setDegree(Double degree) { this.degree = degree; }

    public Double getNormalizedDegree() { return normalizedDegree; }
    public void setNormalizedDegree(Double normalizedDegree) { this.normalizedDegree = normalizedDegree; }

    public List<Integer> getNeighborIds() { return neighborIds; }
    public void setNeighborIds(List<Integer> neighborIds) { this.neighborIds = neighborIds; }
    
    public Double getBetweennessCentrality() { return betweennessCentrality; }
    public void setBetweennessCentrality(Double betweennessCentrality) { this.betweennessCentrality = betweennessCentrality; }

    public Double getClosenessCentrality() { return closenessCentrality; }
    public void setClosenessCentrality(Double closenessCentrality) { this.closenessCentrality = closenessCentrality; }

    public Double getAveragePathLength() { return averagePathLength; }
    public void setAveragePathLength(Double averagePathLength) { this.averagePathLength = averagePathLength; }

    public Double getClusteringCoefficient() { return clusteringCoefficient; }
    public void setClusteringCoefficient(Double clusteringCoefficient) { this.clusteringCoefficient = clusteringCoefficient; }

    public Double getEccentricity() { return eccentricity; }
    public void setEccentricity(Double eccentricity) { this.eccentricity = eccentricity; }
    
}
