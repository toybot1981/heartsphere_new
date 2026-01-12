package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.graph.GraphRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Graph智能推荐API控制器
 */
@RestController
@RequestMapping("/api/admin/graph/recommendations")
public class AdminGraphRecommendationController extends BaseAdminController {
    
    @Autowired
    private GraphRecommendationService recommendationService;
    
    /**
     * 基于上下文的实体推荐
     * POST /api/admin/graph/recommendations/entities
     */
    @PostMapping("/entities")
    public ResponseEntity<Map<String, Object>> recommendEntities(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        String entityType = (String) request.get("entityType");
        @SuppressWarnings("unchecked")
        List<String> existingEntityIds = (List<String>) request.get("existingEntityIds");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.get("context");
        
        List<Map<String, Object>> recommendations = recommendationService.recommendEntitiesByContext(
            admin.getId(),
            entityType,
            existingEntityIds != null ? existingEntityIds : List.of(),
            context != null ? context : new HashMap<>()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", recommendations);
        response.put("total", recommendations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 关系自动识别
     * POST /api/admin/graph/recommendations/relations
     */
    @PostMapping("/relations")
    public ResponseEntity<Map<String, Object>> autoDetectRelations(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entities = (List<Map<String, Object>>) request.get("entities");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.get("context");
        
        List<Map<String, Object>> detectedRelations = recommendationService.autoDetectRelations(
            entities != null ? entities : List.of(),
            context != null ? context : new HashMap<>()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", detectedRelations);
        response.put("total", detectedRelations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 流程优化建议
     * POST /api/admin/graph/recommendations/optimizations
     */
    @PostMapping("/optimizations")
    public ResponseEntity<Map<String, Object>> suggestOptimizations(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) request.get("nodes");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> edges = (List<Map<String, Object>>) request.get("edges");
        
        List<Map<String, Object>> suggestions = recommendationService.suggestOptimizations(
            nodes != null ? nodes : List.of(),
            edges != null ? edges : List.of()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", suggestions);
        response.put("total", suggestions.size());
        
        return ResponseEntity.ok(response);
    }
}
