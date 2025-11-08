package com.fefacio.demo.algorithm.pmedian;

import com.google.ortools.Loader;
import com.google.ortools.linearsolver.MPConstraint;
import com.google.ortools.linearsolver.MPObjective;
import com.google.ortools.linearsolver.MPSolver;
import com.google.ortools.linearsolver.MPVariable;

import java.util.HashSet;
import java.util.Set;

public class PMedianORTools extends PMedianBase {
    
    public PMedianORTools(double[][] distances, double[] weights, int numFacilities) {
        super(distances, weights, numFacilities);
    }
    
    @Override
    public Set<Integer> solve() {
        Loader.loadNativeLibraries();
        
        // Create solver with SCIP
        MPSolver solver = MPSolver.createSolver("SCIP");
        if (solver == null) {
            System.err.println("Could not create solver SCIP");
            return pStar;
        }
        
        // Decision variables
        // x[i][j] = 1 if node i is assigned to facility j
        MPVariable[][] x = new MPVariable[n][m];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                x[i][j] = solver.makeBoolVar("x_" + i + "_" + j);
            }
        }
        
        // y[j] = 1 if facility j is opened
        MPVariable[] y = new MPVariable[m];
        for (int j = 0; j < m; j++) {
            y[j] = solver.makeBoolVar("y_" + j);
        }
        
        // Objective: minimize sum of weighted distances
        MPObjective objective = solver.objective();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                objective.setCoefficient(x[i][j], b[i] * d[i][j]);
            }
        }
        objective.setMinimization();
        
        // Constraint 1: Each node must be assigned to exactly one facility
        for (int i = 0; i < n; i++) {
            MPConstraint constraint = solver.makeConstraint(1, 1, "assign_" + i);
            for (int j = 0; j < m; j++) {
                constraint.setCoefficient(x[i][j], 1);
            }
        }
        
        // Constraint 2: Node can only be assigned to open facilities
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                MPConstraint constraint = solver.makeConstraint(-MPSolver.infinity(), 0, 
                    "link_" + i + "_" + j);
                constraint.setCoefficient(x[i][j], 1);
                constraint.setCoefficient(y[j], -1);
            }
        }
        
        // Constraint 3: Exactly p facilities must be opened
        MPConstraint pConstraint = solver.makeConstraint(p, p, "p_facilities");
        for (int j = 0; j < m; j++) {
            pConstraint.setCoefficient(y[j], 1);
        }
        
        // Solve
        final MPSolver.ResultStatus resultStatus = solver.solve();
        
        // Extract solution
        pStar = new HashSet<>();
        if (resultStatus == MPSolver.ResultStatus.OPTIMAL || 
            resultStatus == MPSolver.ResultStatus.FEASIBLE) {
            
            for (int j = 0; j < m; j++) {
                if (y[j].solutionValue() > 0.5) {
                    pStar.add(j);
                }
            }
            
            sStar = objective.value();
            
            System.out.println("Solution status: " + resultStatus);
            System.out.println("Optimal cost: " + sStar);
            System.out.println("Facilities: " + pStar);
        } else {
            System.err.println("The problem does not have an optimal solution!");
        }
        
        return pStar;
    }
    
    
    @Override
    public String getAlgorithmName() {
        return "P-Median (OR-Tools - Exact Solution)";
    }
}