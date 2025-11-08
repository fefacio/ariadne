package com.fefacio.demo.controller;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fefacio.demo.model.response.StatsGraphResponse;
import com.fefacio.demo.model.response.StatsNodeResponse;
import com.fefacio.demo.service.StatsService;
import org.springframework.web.bind.annotation.RequestParam;


@CrossOrigin(origins = {"http://localhost:3000", "https://ariadne-frontend-40mk.onrender.com"})
@RestController
@RequestMapping("/stats")
public class StatsController {
    @Autowired
    private StatsService statsService;
    
    // @GetMapping("/graph")
    // public ResponseEntity<StatsGraphResponse> getGraphStatistics(){
        
    // }

    @GetMapping("/node/{id}")
    public ResponseEntity<StatsNodeResponse> getNodeStatistics(@PathVariable Integer id) {
        StatsNodeResponse response = statsService.getNodeStatistics(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/node/report")
    public ResponseEntity<byte[]> getNodesReport() {
        try {
            byte[] csvBytes = statsService.getNodesReport();
            
            // Configurar headers para download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "nodes_report.csv");
            headers.setContentLength(csvBytes.length);
            
            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
}
