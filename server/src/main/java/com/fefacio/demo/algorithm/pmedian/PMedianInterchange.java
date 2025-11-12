package com.fefacio.demo.algorithm.pmedian;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class PMedianInterchange extends PMedianBase {
    private int numCycles = 0;
    private int numInterchanges = 0;
    private Random random;
    
    public PMedianInterchange(double[][] distances, double[] weights, 
                                int numFacilities, List<Integer> consumerIds, List<Integer> candidateIds, Set<Integer> initialSolution) {
        super(distances, weights, numFacilities, consumerIds, candidateIds);
        this.pStar = new HashSet<>(initialSolution);
        this.random = new Random();
    }

    public PMedianInterchange(double[][] distances, double[] weights, 
                               int numFacilities, List<Integer> consumerIds, List<Integer> candidateIds, boolean randomInit) {
        super(distances, weights, numFacilities, consumerIds,  candidateIds);
        this.random = new Random();
        if (randomInit) {
            this.pStar = generateRandomInitialSolution(random);
            System.out.println("Initial random solution: " + this.getSolutionNodeIds());
        } else {
            throw new IllegalArgumentException(
                "Use constructor with initialSolution");
        }
    }

    public PMedianInterchange(double[][] distances, double[] weights, 
                               int numFacilities, List<Integer> consumerIds, List<Integer> candidateIds, boolean randomInit, long seed) {
        super(distances, weights, numFacilities, consumerIds, candidateIds);
        this.random = new Random(seed);
        if (randomInit) {
            this.pStar = generateRandomInitialSolution(random);
        } else {
            throw new IllegalArgumentException(
                "Use constructor with initialSolution or set randomInit=true");
        }
    }
    
    @Override
    public String getAlgorithmName() {
        return "Teitz & Bart Interchange";
    }
    
    @Override
    public Set<Integer> solve() {
        // Step 0: Initialization 
        sStar = calculateCost();
        
        // List of possible facilities for exchange
        int numCandidates = m - p;
        List<Integer> pList = new ArrayList<>();
        for (int j = 0; j < m; j++) {
            if (!pStar.contains(j)) {
                pList.add(j);
            }
        }
        
        double s = sStar;
        numCycles = 0;
        numInterchanges = 0;
        
        while (true) {
            numCycles++;
            boolean improved = false;
            
            // Step 1,2
            for (int q = 0; q < numCandidates; q++) {
                int r = pList.get(q);
                
                // Calculate u[i] and w[i] - nearest, second nearest
                double[] u = new double[n];
                double[] w = new double[n];
                
                for (int i = 0; i < n; i++) {
                    double min1 = Double.POSITIVE_INFINITY;
                    double min2 = Double.POSITIVE_INFINITY;
                    for (int j : pStar) {
                        if (d[i][j] < min1) {
                            min2 = min1;
                            min1 = d[i][j];
                        } else if (d[i][j] < min2) {
                            min2 = d[i][j];
                        }
                    }
                    
                    u[i] = min1;
                    w[i] = min2;
                }
                
                // Step 3: Change the facility
                int bestT = -1;
                double bestSrt = 0;
                
                for (int t : pStar) {
                    double srt = 0;
                    
                    // Calcular mudança no custo
                    for (int i = 0; i < n; i++) {
                        if (d[i][t] > u[i]) {
                            // t não é a mais próxima, adicionar r não muda nada
                            srt += b[i] * (Math.min(d[i][r], u[i]) - u[i]);
                        } else if (d[i][t] == u[i]) {
                            // t é a mais próxima
                            srt += b[i] * (Math.min(d[i][r], w[i]) - u[i]);
                        }
                    }
                    
                    if (srt < bestSrt) {
                        bestSrt = srt;
                        bestT = t;
                    }
                }
                
                // Step 4: Se encontrou melhoria, fazer interchange
                if (bestSrt < 0) {
                    sStar += bestSrt;
                    pStar.remove(bestT);
                    pStar.add(r);
                    pList.set(q, bestT);
                    numInterchanges++;
                    improved = true;
                    break; // Recomeçar ciclo
                }
            }
            
            // Step 5: Verificar convergência
            if (!improved) {
                if (s > sStar) {
                    s = sStar;
                } else {
                    break;
                }
            }
        }
        
        return pStar;
    }
    
    public int getNumCycles() {
        return numCycles;
    }
    
    public int getNumInterchanges() {
        return numInterchanges;
    }
}