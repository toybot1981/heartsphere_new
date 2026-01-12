package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.EntityRelationService;
import com.heartsphere.admin.entity.EntityRelation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 实体关系API控制器
 * 提供实体关系的查询、创建、推荐等功能
 */
@RestController
@RequestMapping("/api/admin/entities/relations")
public class AdminEntityRelationController extends BaseAdminController {
    
    @Autowired
    private EntityRelationService relationService;
    
    /**
     * 创建实体关系
     * POST /api/admin/entities/relations
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRelation(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        
        String sourceType = (String) request.get("sourceEntityType");
        String sourceId = request.get("sourceEntityId").toString();
        String targetType = (String) request.get("targetEntityType");
        String targetId = request.get("targetEntityId").toString();
        String relationType = (String) request.get("relationType");
        Integer strength = request.get("strength") != null ? 
            ((Number) request.get("strength")).intValue() : 50;
        
        EntityRelation relation = relationService.createRelation(
            sourceType, sourceId, targetType, targetId, relationType, strength, admin.getId()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", relation.getId());
        response.put("sourceEntityType", relation.getSourceEntityType());
        response.put("sourceEntityId", relation.getSourceEntityId());
        response.put("targetEntityType", relation.getTargetEntityType());
        response.put("targetEntityId", relation.getTargetEntityId());
        response.put("relationType", relation.getRelationType());
        response.put("strength", relation.getStrength());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 查询实体的所有关系
     * GET /api/admin/entities/relations?entityType=character&entityId=123
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getRelations(
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<EntityRelation> relations = relationService.getEntityRelations(entityType, entityId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", relations.stream()
            .map(this::convertRelationToMap)
            .toList());
        response.put("total", relations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 查询两个实体之间的关系
     * GET /api/admin/entities/relations/between?sourceType=character&sourceId=1&targetType=character&targetId=2
     */
    @GetMapping("/between")
    public ResponseEntity<Map<String, Object>> getRelationsBetween(
            @RequestParam String sourceType,
            @RequestParam String sourceId,
            @RequestParam String targetType,
            @RequestParam String targetId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<EntityRelation> relations = relationService.getRelationsBetween(
            sourceType, sourceId, targetType, targetId
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", relations.stream()
            .map(this::convertRelationToMap)
            .toList());
        response.put("total", relations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 推荐相关实体
     * GET /api/admin/entities/relations/recommend?entityType=character&entityId=123&limit=10
     */
    @GetMapping("/recommend")
    public ResponseEntity<Map<String, Object>> recommendRelatedEntities(
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<Map<String, Object>> recommendations = relationService.recommendRelatedEntities(
            entityType, entityId, limit
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", recommendations);
        response.put("total", recommendations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 推荐可能的关系
     * GET /api/admin/entities/relations/recommend-relation?sourceType=character&sourceId=1&targetType=character&targetId=2
     */
    @GetMapping("/recommend-relation")
    public ResponseEntity<Map<String, Object>> recommendPossibleRelations(
            @RequestParam String sourceType,
            @RequestParam String sourceId,
            @RequestParam String targetType,
            @RequestParam String targetId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<Map<String, Object>> recommendations = relationService.recommendPossibleRelations(
            sourceType, sourceId, targetType, targetId
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", recommendations);
        response.put("total", recommendations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 更新关系强度
     * PUT /api/admin/entities/relations/{id}/strength
     */
    @PutMapping("/{id}/strength")
    public ResponseEntity<Map<String, Object>> updateRelationStrength(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Integer strength = ((Number) request.get("strength")).intValue();
        EntityRelation relation = relationService.updateRelationStrength(id, strength);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", relation.getId());
        response.put("strength", relation.getStrength());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 删除关系
     * DELETE /api/admin/entities/relations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRelation(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        relationService.deleteRelation(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "关系已删除");
        response.put("id", id);
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> convertRelationToMap(EntityRelation relation) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", relation.getId());
        map.put("sourceEntityType", relation.getSourceEntityType());
        map.put("sourceEntityId", relation.getSourceEntityId());
        map.put("targetEntityType", relation.getTargetEntityType());
        map.put("targetEntityId", relation.getTargetEntityId());
        map.put("relationType", relation.getRelationType());
        map.put("strength", relation.getStrength());
        map.put("description", relation.getDescription());
        return map;
    }
}
