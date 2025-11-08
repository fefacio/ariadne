package com.fefacio.demo.algorithm.pmedian;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

abstract class PMedianBase implements PMedianAlgorithm {
    protected int n;              // número de nós
    protected int m;              // número de possíveis localizações
    protected int p;              // número de facilidades
    protected double[][] d;       // matriz de distâncias
    protected double[] b;         // pesos/demandas
    protected Set<Integer> pStar; // facilidades escolhidas
    protected double sStar;       // custo da solução
    
    public PMedianBase(double[][] distances, double[] weights, int numFacilities) {
        this.n = distances.length;
        this.m = distances[0].length;
        this.p = numFacilities;
        this.d = distances;
        this.b = weights;
        this.pStar = new HashSet<>();
    }
    
    @Override
    public double getSolutionCost() {
        return sStar;
    }

    public Set<Integer> getSolution() {
        return pStar;
    }
    

    public double calculateCost() {
        double cost = 0;
        for (int i = 0; i < n; i++) {
            double minDist = Double.POSITIVE_INFINITY;
            for (int j : pStar) {
                minDist = Math.min(minDist, d[i][j]);
            }
            cost += b[i] * minDist;
        }
        return cost;
    }
    

    public Map<Integer, Integer> getAssignments() {
        Map<Integer, Integer> assignments = new HashMap<>();
        for (int i = 0; i < n; i++) {
            double minDist = Double.POSITIVE_INFINITY;
            int nearestFacility = -1;
            for (int j : pStar) {
                if (d[i][j] < minDist) {
                    minDist = d[i][j];
                    nearestFacility = j;
                }
            }
            assignments.put(i, nearestFacility);
        }
        return assignments;
    }

    public Set<Integer> generateRandomInitialSolution(Random random) {
        Set<Integer> facilities = new HashSet<>();
        List<Integer> available = new ArrayList<>();
        
        for (int i = 0; i < m; i++) {
            available.add(i);
        }
        
        Collections.shuffle(available, random);
        
        for (int i = 0; i < p && i < available.size(); i++) {
            facilities.add(available.get(i));
        }
        
        return facilities;
    }
}