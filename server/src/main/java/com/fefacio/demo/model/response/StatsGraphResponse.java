package com.fefacio.demo.model.response;

public class StatsGraphResponse {
    private Integer numberOfNodes;
    private Integer numberOfEdges;
    private Integer numberOfConsumers;
    private Integer numberOfCandidates;
    private Double avgDemand;

    // Degree
    private Double minDegree;
    private Double maxDegree;
    private Double avgDegree;


    // Strength
    private Double minStrength;
    private Double maxStrength;
    private Double avgStrength;

    // Stats
    private Double density;
    private Double radius;
    private Double diamater;
    private Double avgClusteringCoefficient;
    private Double avgPathLength;

    // Centrality
    private Double avgDegreeCentrality;
    private Double avgStrengthCentrality;
    private Double avgClosenessCentrality;
    private Double avgBetweennessCentrality;

    

    public Integer getNumberOfNodes() { return numberOfNodes; }
    public void setNumberOfNodes(Integer numberOfNodes) { this.numberOfNodes = numberOfNodes; }

    public Integer getNumberOfEdges() { return numberOfEdges; }
    public void setNumberOfEdges(Integer numberOfEdges) { this.numberOfEdges = numberOfEdges; }

    public Integer getNumberOfConsumers() { return numberOfConsumers; }
    public void setNumberOfConsumers(Integer numberOfConsumers) { this.numberOfConsumers = numberOfConsumers; }

    public Integer getNumberOfCandidates() { return numberOfCandidates; }
    public void setNumberOfCandidates(Integer numberOfCandidates) { this.numberOfCandidates = numberOfCandidates; }

    public Double getAvgDemand() { return avgDemand; }
    public void setAvgDemand(Double avgDemand) { this.avgDemand = avgDemand; }

    public Double getMinDegree() { return minDegree; }
    public void setMinDegree(Double minDegree) { this.minDegree = minDegree; }

    public Double getMaxDegree() { return maxDegree; }
    public void setMaxDegree(Double maxDegree) { this.maxDegree = maxDegree; }

    public Double getAvgDegree() { return avgDegree; }
    public void setAvgDegree(Double avgDegree) { this.avgDegree = avgDegree; }

    public Double getMinStrength() { return minStrength; }
    public void setMinStrength(Double minStrength) { this.minStrength = minStrength; }

    public Double getMaxStrength() { return maxStrength; }
    public void setMaxStrength(Double maxStrength) { this.maxStrength = maxStrength; }

    public Double getAvgStrength() { return avgStrength; }
    public void setAvgStrength(Double avgStrength) { this.avgStrength = avgStrength; }

    public Double getDensity() { return density; }
    public void setDensity(Double density) { this.density = density; }

    public Double getRadius() { return radius; }
    public void setRadius(Double radius) { this.radius = radius; }

    public Double getDiamater() { return diamater; }
    public void setDiamater(Double diamater) { this.diamater = diamater; }

    public Double getAvgClusteringCoefficient() { return avgClusteringCoefficient; }
    public void setAvgClusteringCoefficient(Double avgClusteringCoefficient) { this.avgClusteringCoefficient = avgClusteringCoefficient; }

    public Double getAvgPathLength() { return avgPathLength; }
    public void setAvgPathLength(Double avgPathLength) { this.avgPathLength = avgPathLength; }
    
    public Double getAvgDegreeCentrality() { return avgDegreeCentrality; }
    public void setAvgDegreeCentrality(Double avgDegreeCentrality) { this.avgDegreeCentrality = avgDegreeCentrality; }

    public Double getAvgStrengthCentrality() { return avgStrengthCentrality; }
    public void setAvgStrengthCentrality(Double avgStrengthCentrality) { this.avgStrengthCentrality = avgStrengthCentrality; }

    public Double getAvgClosenessCentrality() { return avgClosenessCentrality; }
    public void setAvgClosenessCentrality(Double avgClosenessCentrality) { this.avgClosenessCentrality = avgClosenessCentrality; }

    public Double getAvgBetweennessCentrality() { return avgBetweennessCentrality; }
    public void setAvgBetweennessCentrality(Double avgBetweennessCentrality) { this.avgBetweennessCentrality = avgBetweennessCentrality; }

  

}
