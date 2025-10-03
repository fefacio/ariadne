package com.fefacio.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fefacio.demo.service.GraphService;
import com.fefacio.demo.model.request.EdgeRequest;
import com.fefacio.demo.model.request.NodeRequest;
import com.fefacio.demo.model.graph.Edge;
import com.fefacio.demo.model.graph.Node;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@CrossOrigin(origins = {"http://localhost:3000", "https://ariadne-frontend-40mk.onrender.com/"})
@RestController
@RequestMapping("/graph")
public class GraphController {
    @Autowired
    private GraphService graphService;

    @GetMapping("/node/{nodeId}")
    public Node getNode(@PathVariable Integer nodeId) {
        return graphService.getNode(nodeId);
    }
    
    @PostMapping("/node")
    public Integer createNode(@RequestBody NodeRequest nodeRequest) {
        return graphService.addNode(nodeRequest);
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

    @GetMapping("/edge/{edgeId}")
    public Edge getEdge(@PathVariable Integer edgeId) {
        return graphService.getEdge(edgeId);
    }

    @PostMapping("/edge")
    public Integer createEdge(@RequestBody EdgeRequest edgeRequest) {
        return graphService.addEdge(edgeRequest);
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

    @DeleteMapping("/clear")
    public void clearGraph() {
        System.out.println("[DELETE][/clear]");
        graphService.clearGraph();
    }

}
