// APRESENTACAO SEMANA DIA 09
// ASSORTIVIDADE

package com.fefacio.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fefacio.demo.service.GraphService;
import com.fefacio.demo.model.request.ClusteringRequest;
import com.fefacio.demo.model.request.EdgeRequest;
import com.fefacio.demo.model.request.NodeRequest;
import com.fefacio.demo.model.request.PMedianRequest;
import com.fefacio.demo.model.request.SearchRequest;
import com.fefacio.demo.model.response.ClusteringResponse;
import com.fefacio.demo.model.response.EdgeResponse;
import com.fefacio.demo.model.response.GraphDataResponse;
import com.fefacio.demo.model.response.NodeResponse;
import com.fefacio.demo.model.response.PMedianResponse;
import com.fefacio.demo.model.response.SearchResponse;
import com.fefacio.demo.algorithm.GraphClustering;
import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.Node;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




@CrossOrigin(origins = {"http://localhost:3000", "https://ariadne-frontend-40mk.onrender.com"})
@RestController
@RequestMapping("/graph")
public class GraphController {
    @Autowired
    private GraphService graphService;

    // NODE
    @GetMapping("/node/{nodeId}")
    public Node getNode(@PathVariable Integer nodeId) {
        return graphService.getNode(nodeId);
    }
    
    @PostMapping("/node")
    public Integer createNode(@RequestBody NodeRequest nodeRequest) {
        return graphService.addNode(nodeRequest);
    }

    @PutMapping("/node/{nodeId}")
    public Node putNode(@PathVariable Integer nodeId, @RequestBody NodeRequest nodeRequest) {
        return graphService.updateNode(nodeId, nodeRequest);
    }

    @DeleteMapping("/node/{nodeId}")
    public ResponseEntity<Void> deleteNode(@PathVariable Integer nodeId) {
        boolean removed = graphService.removeNode(nodeId);
        if (removed) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // EDGE
    @GetMapping("/edge/{edgeId}")
    public Edge getEdge(@PathVariable Integer edgeId) {
        return graphService.getEdge(edgeId);
    }

    @PostMapping("/edge") 
    public ResponseEntity<List<EdgeResponse>> createEdge(@RequestBody EdgeRequest edgeRequest) {
        List<Edge> createdEdges = graphService.addEdge(edgeRequest);
        
        List<EdgeResponse> response = createdEdges.stream()
            .map(edge -> new EdgeResponse(
                edge.getId(),
                edge.getSource().getId(), 
                edge.getTarget().getId(),  
                edge.getWeight()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/edge/{edgeId}")
    public Edge putEdge(@PathVariable Integer edgeId, @RequestBody EdgeRequest edgeRequest) {
        return graphService.updateEdge(edgeId, edgeRequest);
    }

    @DeleteMapping("/edge/{edgeId}")
    public ResponseEntity<Void> deleteEdge(@PathVariable Integer edgeId) {
        boolean removed = graphService.removeEdge(edgeId);
        if (removed) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/data")
    public GraphDataResponse getGraphData() {
        return graphService.getGraphData();
    }

    @DeleteMapping("/clear")
    public void clearGraph() {
        System.out.println("[DELETE][/clear]");
        graphService.clearGraph();
    }

    /**
     * Import Graph from JSON String
     * POST /graph/import/json
     * Body: String .json
     * Query params: 
     *   - clearExisting (default: true)
     */
    @PostMapping("/import/json")
    public ResponseEntity<Map<String, Object>> importJson(
            @RequestBody String jsonContent,
            @RequestParam(defaultValue = "true") boolean clearExisting) {
        
        try {
            graphService.importGraphJson(jsonContent, clearExisting);
            
            List<NodeResponse> nodes = graphService.getAllNodes();
            List<EdgeResponse> edges = graphService.getAllEdges();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Graph imported successfully");
            response.put("nodes", nodes);
            response.put("edges", edges);
            response.put("nodeCount", nodes.size());
            response.put("edgeCount", edges.size());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid JSON format: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to import: " + e.getMessage()));
        }
    }

    /**
     * Search path from source to node
     * POST /graph/algorithm/search
     * Body: String .json
     * Query params: 
     *   - clearExisting (default: true)
     */
    @PostMapping("/algorithm/search")
    public ResponseEntity<?> search(@RequestBody SearchRequest request) {
        try {
            String requestMethod = request.getMethod().toUpperCase();
            Integer requestSourceId = request.getSourceId();
            Integer requestTargetId = request.getTargetId();

            if (requestMethod == null || requestMethod.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Method is required"));
            }
            
            if (requestSourceId == null || requestTargetId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Source and target IDs are required"));
            }
            
            SearchResponse searchResponse = graphService.graphSearch(requestMethod, requestSourceId, requestTargetId);
            
        
            
            
            return ResponseEntity.ok(searchResponse);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/algorithm/pmedian")
    public ResponseEntity<PMedianResponse> pmedian(@RequestBody PMedianRequest request) {
        try {
            String algorithm= request.getAlgorithm().toUpperCase();
            Integer p = request.getP();
            Boolean useDemand = request.getUseDemand();
            Boolean useRandomInitialization = request.getUseRandomInitialization();
    
            if (algorithm == null || algorithm.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new PMedianResponse("Algorithm is required"));
            }

            if (p == null) {
                return ResponseEntity.badRequest()
                    .body(new PMedianResponse("Number of facilities (p) is required"));
            }

            if (p < 1) {
                return ResponseEntity.badRequest()
                    .body(new PMedianResponse("Number of facilities needs to be greather than 0"));
            }        
            PMedianResponse pMedianResponse = graphService.graphPMedian(algorithm, p, useDemand, useRandomInitialization);

            
            return ResponseEntity.ok(pMedianResponse);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new PMedianResponse("Error while executing p-median: " + e.getMessage()));
        }
    }

    @PostMapping("/algorithm/cluster")
    public ResponseEntity<ClusteringResponse> cluster(
            @RequestBody ClusteringRequest request) {
        
        try {
            if (request.getK() == null || request.getK() <= 0) {
                return ResponseEntity.badRequest()
                    .body(new ClusteringResponse("Number of clusters (k) must be positive"));
            }
            
            if (request.getMaxIterations() != null && request.getMaxIterations() <= 0) {
                return ResponseEntity.badRequest()
                    .body(new ClusteringResponse("maxIterations must be positive"));
            }
            
            if (request.getMaxTrials() != null && request.getMaxTrials() <= 0) {
                return ResponseEntity.badRequest()
                    .body(new ClusteringResponse("maxTrials must be positive"));
            }

            ClusteringResponse clusteringResponse = graphService.graphCluster(request);
            return ResponseEntity.ok(clusteringResponse);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ClusteringResponse(e.getMessage()));
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ClusteringResponse("Error while executing clustering: " + e.getMessage()));
        }
    }


    @GetMapping("/health")
    public Map<String, Boolean> getHealth() {
        return Map.of("isServerUp", true);
    }   

}
