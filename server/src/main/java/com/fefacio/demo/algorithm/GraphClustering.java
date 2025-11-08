package com.fefacio.demo.algorithm;

import org.apache.commons.math3.linear.EigenDecomposition;
import org.apache.commons.math3.linear.RealMatrix;
import org.apache.commons.math3.linear.RealVector;
import org.apache.commons.math3.ml.clustering.KMeansPlusPlusClusterer;

import com.fefacio.demo.model.graph.Graph;
import com.fefacio.demo.model.graph.Node;

import org.apache.commons.math3.ml.clustering.Clusterable;
import org.apache.commons.math3.ml.clustering.CentroidCluster;

import java.util.*;

public class GraphClustering {
    private Graph graph;

    public GraphClustering(Graph graph) {
        this.graph = graph;
    }

    /**
     * Spectral Clustering using Laplacian Matrix
     * @param k número de clusters desejados
     * @param maxIterations iterações máximas para K-means
     * @return Map<nodeId, Cluster>
     */
    public Map<Integer, Integer> spectralClustering(int k, int maxIterations, int maxTrials) {
        if (k <= 0) {
            throw new IllegalArgumentException("Number of clusters needs to be >=1");
        }
        
        int nodeCount = graph.getNodeCount();
        if (k >= nodeCount) {
            throw new IllegalArgumentException("Number of clusters cant be greater then node count");
        }

        // 1. Calculate the Laplacian or the normalized Laplacian
        RealMatrix laplacian = graph.getLaplacianMatrix();

        // 2. Calculate the first k eigenvectors (the eigenvectors corresponding to the 
        // k smallest eigenvalues of L)
        EigenDecomposition eigenDecomp = new EigenDecomposition(laplacian);
        List<EigenPair> eigenPairs = new ArrayList<>();
        for (int i = 0; i < nodeCount; i++) {
            eigenPairs.add(new EigenPair(
                eigenDecomp.getRealEigenvalue(i),
                eigenDecomp.getEigenvector(i)
            ));
        }
        eigenPairs.sort(Comparator.comparingDouble(ep -> ep.eigenvalue));
        
        // 3. Consider the matrix formed by the first k eigenvectors; the l-th row 
        // defines the features of graph node l
        double[][] features = new double[nodeCount][k];
        for (int i = 0; i < nodeCount; i++) {
            for (int j = 0; j < k; j++) {
                features[i][j] = eigenPairs.get(j+1).eigenvector.getEntry(i);
            }
        }

        // 3.5. Normalize the matrix
        for (int i = 0; i < nodeCount; i++) {
            double norm = 0;
            for (int j = 0; j < k; j++) {
                norm += features[i][j] * features[i][j];
            }
            norm = Math.sqrt(norm);
            if (norm > 1e-10) {
                for (int j = 0; j < k; j++) {
                    features[i][j] /= norm;
                }
            }
        }

        // 4. Cluster the graph nodes based on these features (e.g., using k-means clustering)
        List<FeaturePoint> points = new ArrayList<>();
        List<Node> nodes = graph.getNodes();
        for (int i = 0; i < nodeCount; i++) {
            points.add(new FeaturePoint(features[i], nodes.get(i).getId()));
        }

        Map<Integer, Integer> bestClusters = null;
        double bestInertia = Double.POSITIVE_INFINITY;
        
        for (int trial = 0; trial < maxTrials; trial++) {
            KMeansPlusPlusClusterer<FeaturePoint> kmeans = 
                new KMeansPlusPlusClusterer<>(k, maxIterations);
            List<CentroidCluster<FeaturePoint>> clusterResults = kmeans.cluster(points);
            
            // K-Means Inertia (Square sum of the distances between each point in the cluster).
            double inertia = 0.0;
            for (CentroidCluster<FeaturePoint> cluster : clusterResults) {
                double[] centroid = cluster.getCenter().getPoint();
                for (FeaturePoint point : cluster.getPoints()) {
                    double dist = 0.0;
                    for (int d = 0; d < centroid.length; d++) {
                        double diff = point.getPoint()[d] - centroid[d];
                        dist += diff * diff;
                    }
                    inertia += dist;
                }
            }
            
            if (inertia < bestInertia) {
                bestInertia = inertia;
                bestClusters = new HashMap<>();
                for (int clusterIdx = 0; clusterIdx < clusterResults.size(); clusterIdx++) {
                    for (FeaturePoint point : clusterResults.get(clusterIdx).getPoints()) {
                        bestClusters.put(point.nodeId, clusterIdx);
                    }
                }
            }
        }

        return bestClusters;
    }


    public Map<Integer, Integer> spectralClustering(int k) {
        return spectralClustering(k, 1000, 10);
    }

    // Newman (2006)
    // Q = 1/(2m) × Σᵢⱼ [Aᵢⱼ - (kᵢ×kⱼ)/(2m)] × δ(cᵢ, cⱼ)
    public double calculateModularity(Map<Integer, Integer> clusterAssignments) {
        double modularity = 0.0;
        int m = graph.getEdgeCount();
        
        if (m == 0) return 0.0;

        for (Node u : graph.getNodes()) {
            for (Node v : graph.getNodes()) {
                Integer clusterU = clusterAssignments.get(u.getId());
                Integer clusterV = clusterAssignments.get(v.getId());
                
                if (clusterU != null && clusterU.equals(clusterV)) {
                    double aij = graph.getEdgeWeightFromNodes(u,v);
                    double degU = graph.getDegree(u);
                    double degV = graph.getDegree(v);
                    
                    modularity += aij - (degU * degV) / (2.0 * m);
                }
            }
        }
        
        return modularity / (2.0 * m);
    }

    

    private static class EigenPair {
        double eigenvalue;
        RealVector eigenvector;

        EigenPair(double eigenvalue, RealVector eigenvector) {
            this.eigenvalue = eigenvalue;
            this.eigenvector = eigenvector;
        }
    }

    private static class FeaturePoint implements Clusterable {
        private double[] features;
        private Integer nodeId;

        FeaturePoint(double[] features, Integer nodeId) {
            this.features = features;
            this.nodeId = nodeId;
        }

        @Override
        public double[] getPoint() {
            return features;
        }
    }
}