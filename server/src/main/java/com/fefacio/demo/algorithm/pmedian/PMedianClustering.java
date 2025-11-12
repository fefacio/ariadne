package com.fefacio.demo.algorithm.pmedian;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fefacio.demo.algorithm.GraphClustering;
import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;
import com.fefacio.demo.model.graph.NodeType;

public class PMedianClustering extends PMedianBase {
    private Graph graph;
    private Map<Integer, Integer> nodeToCluster;
    
    public PMedianClustering(double[][] distances, double[] weights, int numFacilities,
                            List<Integer> consumerIds, List<Integer> candidateIds,
                            Graph graph) {
        super(distances, weights, numFacilities, consumerIds, candidateIds);
        this.graph = graph;
    }
    
    @Override
    public String getAlgorithmName() {
        return "Clustering-based";
    }
    
    @Override
    public Set<Integer> solve() {
        pStar.clear();
        
        // 1. Clustering with k = p
        GraphClustering clustering = new GraphClustering(graph);
        
        nodeToCluster = clustering.spectralClustering(p);
        System.out.println("NODE TO CLUSTER: "+ nodeToCluster);
        
        // 2. Get nodes per cluster
        Map<Integer, List<Node>> clusterNodes = new HashMap<>();
        for (Node node : graph.getNodes()) {
            Integer cluster = nodeToCluster.get(node.getId());
            clusterNodes.computeIfAbsent(cluster, k -> new ArrayList<>()).add(node);
        }
        
        // 3. For each cluster, find the facility candidate that minimizes the distance 
        // to all other consumers in the same cluster
        for (Map.Entry<Integer, List<Node>> entry : clusterNodes.entrySet()) {
            Integer clusterNumber = entry.getKey();
            List<Node> nodesInCluster = entry.getValue();

            List<Node> candidates = new ArrayList<>();
            List<Node> consumers = new ArrayList<>();
            for (Node node : nodesInCluster) {
                if (node.getType() == NodeType.CONSUMER) {
                    consumers.add(node);
                } else {
                    candidates.add(node);
                }
            }
            if (candidates.isEmpty() && !consumers.isEmpty()) {
                throw new IllegalStateException(
                    "Cluster " + clusterNumber + " has " + consumers.size() + 
                    " consumer(s) but no facility candidates. Cannot assign facilities."
                );
            }
            
            if (consumers.isEmpty() && !candidates.isEmpty()) {
                throw new IllegalStateException(
                    "Cluster " + clusterNumber + " has " + candidates.size() + 
                    " facility candidate(s) but no consumers. Invalid clustering configuration."
                );
            }
            
            if (candidates.isEmpty() || consumers.isEmpty()) {
                continue; 
            }
            
        
            int bestCandidateIdx = -1;
            double minCost = Double.POSITIVE_INFINITY;
            
            for (Node candidate : candidates) {
                double cost = 0;
                
                for (Node consumer : consumers) {
                    int consumerIdx = consumerIds.indexOf(consumer.getId());
                    int candidateIdx = candidateIds.indexOf(candidate.getId());
                    
                    cost += b[consumerIdx] * d[consumerIdx][candidateIdx];
                }
                
                if (cost < minCost) {
                    minCost = cost;
                    bestCandidateIdx = candidateIds.indexOf(candidate.getId());
                }
            }
            System.out.println("BEST CANDIDATE ID: "+ bestCandidateIdx);
            if (bestCandidateIdx != -1) {
                pStar.add(bestCandidateIdx);
            }
        }
        if (pStar.isEmpty()) {
            throw new IllegalStateException(
                "No facilities were selected. This may indicate an issue with the clustering or graph configuration."
            );
        }
        
        // 4. Final cost
        sStar = calculateCost();
        
        return pStar;
    }

    @Override
    public Map<Integer, Integer> getAssignmentsWithNodeIds() {
        Map<Integer, Integer> assignments = new HashMap<>();
        
        for (int i = 0; i < n; i++) {
            Integer consumerId = consumerIds.get(i);
            Integer consumerCluster = nodeToCluster.get(consumerId);
            
            double minDist = Double.POSITIVE_INFINITY;
            int nearestFacilityIndex = -1;
            
            for (int j : pStar) {
                Integer facilityId = candidateIds.get(j);
                Integer facilityCluster = nodeToCluster.get(facilityId);
                
                if (consumerCluster != null && consumerCluster.equals(facilityCluster)) {
                    if (d[i][j] < minDist) {
                        minDist = d[i][j];
                        nearestFacilityIndex = j;
                    }
                }
            }
            
            if (nearestFacilityIndex != -1) {
                Integer facilityId = candidateIds.get(nearestFacilityIndex);
                assignments.put(consumerId, facilityId);
            } else {
                System.out.println("Warning: Consumer " + consumerId + " has no facility in its cluster");
            }
        }
        
        return assignments;
    }
}