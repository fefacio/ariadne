package com.fefacio.demo.algorithm.pmedian;

import java.util.Arrays;
import java.util.Set;

public class PMedianGreedy extends PMedianBase {
    public PMedianGreedy(double[][] distances, double[] weights, int numFacilities) {
        super(distances, weights, numFacilities);
    }
    
    @Override
    public String getAlgorithmName() {
        return "Greedy (CFN)";
    }
    
    @Override
    public Set<Integer> solve() {
        // Step 0: Initialization
        pStar.clear();
        int k = 1;
        double[] u = new double[n];
        Arrays.fill(u, Double.POSITIVE_INFINITY);
        
        while (k <= p) {
            // Step 1: Calculate cost for evey facility no in pStar
            double[] c = new double[m];
            for (int j = 0; j < m; j++) {
                if (pStar.contains(j)) {
                    c[j] = Double.POSITIVE_INFINITY;
                    continue;
                }
                
                c[j] = 0;
                for (int i = 0; i < n; i++) {
                    c[j] += b[i] * Math.min(d[i][j], u[i]);
                }
            }
            
            // Step 2: Find facility candidate with min cost
            int r = -1;
            double minCost = Double.POSITIVE_INFINITY;
            for (int j = 0; j < m; j++) {
                if (!pStar.contains(j) && c[j] < minCost) {
                    minCost = c[j];
                    r = j;
                }
            }
            
            // Step 3: Add the candidade facility to the solution set
            pStar.add(r);
            
            if (k == p) {
                sStar = minCost;
                break;
            }
            
            // Step 4: Update u[i]
            for (int i = 0; i < n; i++) {
                u[i] = Math.min(d[i][r], u[i]);
            }
            
            k++;
        }
        // Solution cost
        return pStar;
    }
}
