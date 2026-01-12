package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.ScenarioEvent;
import com.heartsphere.entity.ScenarioItem;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.ScenarioEventRepository;
import com.heartsphere.repository.ScenarioItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Graph智能推荐服务
 * 提供基于上下文的实体推荐、关系自动识别、流程优化建议等功能
 */
@Slf4j
@Service
public class GraphRecommendationService {
    
    @Autowired
    private EraRepository eraRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired
    private ScenarioEventRepository scenarioEventRepository;
    
    @Autowired
    private ScenarioItemRepository scenarioItemRepository;
    
    @Autowired
    private EntityRelationService entityRelationService;
    
    /**
     * 基于上下文的实体推荐
     * 根据当前Graph中已有的实体，推荐可能相关的其他实体
     */
    public List<Map<String, Object>> recommendEntitiesByContext(
            Long userId,
            String entityType,
            List<String> existingEntityIds,
            Map<String, Object> context) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        try {
            switch (entityType.toLowerCase()) {
                case "era":
                case "scene":
                    recommendations = recommendErasByContext(userId, existingEntityIds, context);
                    break;
                case "character":
                    recommendations = recommendCharactersByContext(userId, existingEntityIds, context);
                    break;
                case "event":
                    recommendations = recommendEventsByContext(userId, existingEntityIds, context);
                    break;
                case "item":
                    recommendations = recommendItemsByContext(userId, existingEntityIds, context);
                    break;
                default:
                    log.warn("未知的实体类型: {}", entityType);
            }
        } catch (Exception e) {
            log.error("推荐实体失败", e);
        }
        
        return recommendations;
    }
    
    /**
     * 推荐场景
     */
    private List<Map<String, Object>> recommendErasByContext(
            Long userId,
            List<String> existingEntityIds,
            Map<String, Object> context) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // 1. 基于用户已有的场景推荐
        List<Era> userEras = eraRepository.findAllByUser_Id(userId);
        for (Era era : userEras) {
            if (existingEntityIds.contains(String.valueOf(era.getId()))) {
                continue;
            }
            
            Map<String, Object> rec = new HashMap<>();
            rec.put("entityId", String.valueOf(era.getId()));
            rec.put("entityName", era.getName());
            rec.put("entityType", "era");
            rec.put("description", era.getDescription());
            rec.put("reason", "用户已创建的场景");
            rec.put("score", 50.0);
            recommendations.add(rec);
        }
        
        // 2. 基于世界关联推荐
        Long worldId = context != null ? (Long) context.get("worldId") : null;
        if (worldId != null) {
            List<Era> worldEras = eraRepository.findByWorld_Id(worldId);
            for (Era era : worldEras) {
                if (existingEntityIds.contains(String.valueOf(era.getId()))) {
                    continue;
                }
                
                Map<String, Object> rec = new HashMap<>();
                rec.put("entityId", String.valueOf(era.getId()));
                rec.put("entityName", era.getName());
                rec.put("entityType", "era");
                rec.put("description", era.getDescription());
                rec.put("reason", "同一世界中的场景");
                rec.put("score", 60.0);
                recommendations.add(rec);
            }
        }
        
        // 按分数排序
        recommendations.sort((a, b) -> {
            double scoreA = ((Number) a.get("score")).doubleValue();
            double scoreB = ((Number) b.get("score")).doubleValue();
            return Double.compare(scoreB, scoreA);
        });
        
        return recommendations.stream().limit(10).collect(Collectors.toList());
    }
    
    /**
     * 推荐角色
     */
    private List<Map<String, Object>> recommendCharactersByContext(
            Long userId,
            List<String> existingEntityIds,
            Map<String, Object> context) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // 1. 基于场景推荐角色
        Long eraId = context != null ? (Long) context.get("eraId") : null;
        if (eraId != null) {
            List<Character> eraCharacters = characterRepository.findByEra_Id(eraId);
            for (Character character : eraCharacters) {
                if (existingEntityIds.contains(String.valueOf(character.getId()))) {
                    continue;
                }
                
                Map<String, Object> rec = new HashMap<>();
                rec.put("entityId", String.valueOf(character.getId()));
                rec.put("entityName", character.getName());
                rec.put("entityType", "character");
                rec.put("description", character.getDescription());
                rec.put("reason", "场景中的角色");
                rec.put("score", 70.0);
                recommendations.add(rec);
            }
        }
        
        // 2. 基于用户已有的角色推荐
        List<Character> userCharacters = characterRepository.findByUser_Id(userId);
        for (Character character : userCharacters) {
            if (existingEntityIds.contains(String.valueOf(character.getId()))) {
                continue;
            }
            
            Map<String, Object> rec = new HashMap<>();
            rec.put("entityId", String.valueOf(character.getId()));
            rec.put("entityName", character.getName());
            rec.put("entityType", "character");
            rec.put("description", character.getDescription());
            rec.put("reason", "用户已创建的角色");
            rec.put("score", 50.0);
            recommendations.add(rec);
        }
        
        // 3. 基于关系推荐（如果已有角色，推荐相关角色）
        if (!existingEntityIds.isEmpty()) {
            for (String charId : existingEntityIds) {
                try {
                    List<Map<String, Object>> related = entityRelationService.recommendRelatedEntities(
                        "character", charId, 5
                    );
                    for (Map<String, Object> rel : related) {
                        String relatedId = String.valueOf(rel.get("entityId"));
                        if (!existingEntityIds.contains(relatedId) && 
                            recommendations.stream().noneMatch(r -> r.get("entityId").equals(relatedId))) {
                            Map<String, Object> rec = new HashMap<>();
                            rec.put("entityId", relatedId);
                            rec.put("entityName", rel.get("entityName"));
                            rec.put("entityType", "character");
                            rec.put("description", "与已有角色相关的角色");
                            rec.put("reason", "关系推荐");
                            rec.put("score", 80.0);
                            recommendations.add(rec);
                        }
                    }
                } catch (Exception e) {
                    log.debug("获取角色关系失败: {}", e.getMessage());
                }
            }
        }
        
        // 按分数排序
        recommendations.sort((a, b) -> {
            double scoreA = ((Number) a.get("score")).doubleValue();
            double scoreB = ((Number) b.get("score")).doubleValue();
            return Double.compare(scoreB, scoreA);
        });
        
        return recommendations.stream().limit(10).collect(Collectors.toList());
    }
    
    /**
     * 推荐事件
     */
    private List<Map<String, Object>> recommendEventsByContext(
            Long userId,
            List<String> existingEntityIds,
            Map<String, Object> context) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // 1. 基于场景推荐事件
        Long eraId = context != null ? (Long) context.get("eraId") : null;
        if (eraId != null) {
            List<ScenarioEvent> eraEvents = scenarioEventRepository.findByEraIdOrSystem(eraId);
            for (ScenarioEvent event : eraEvents) {
                if (existingEntityIds.contains(String.valueOf(event.getId()))) {
                    continue;
                }
                
                Map<String, Object> rec = new HashMap<>();
                rec.put("entityId", String.valueOf(event.getId()));
                rec.put("entityName", event.getName());
                rec.put("entityType", "event");
                rec.put("description", event.getDescription());
                rec.put("reason", "场景中的事件");
                rec.put("score", 70.0);
                recommendations.add(rec);
            }
        }
        
        // 2. 基于用户已有的事件推荐
        List<ScenarioEvent> userEvents = scenarioEventRepository.findByUser_IdAndIsDeletedFalse(userId);
        for (ScenarioEvent event : userEvents) {
            if (existingEntityIds.contains(String.valueOf(event.getId()))) {
                continue;
            }
            
            Map<String, Object> rec = new HashMap<>();
            rec.put("entityId", String.valueOf(event.getId()));
            rec.put("entityName", event.getName());
            rec.put("entityType", "event");
            rec.put("description", event.getDescription());
            rec.put("reason", "用户已创建的事件");
            rec.put("score", 50.0);
            recommendations.add(rec);
        }
        
        // 按分数排序
        recommendations.sort((a, b) -> {
            double scoreA = ((Number) a.get("score")).doubleValue();
            double scoreB = ((Number) b.get("score")).doubleValue();
            return Double.compare(scoreB, scoreA);
        });
        
        return recommendations.stream().limit(10).collect(Collectors.toList());
    }
    
    /**
     * 推荐物品
     */
    private List<Map<String, Object>> recommendItemsByContext(
            Long userId,
            List<String> existingEntityIds,
            Map<String, Object> context) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // 1. 基于场景推荐物品
        Long eraId = context != null ? (Long) context.get("eraId") : null;
        if (eraId != null) {
            List<ScenarioItem> eraItems = scenarioItemRepository.findByEraIdOrSystem(eraId);
            for (ScenarioItem item : eraItems) {
                if (existingEntityIds.contains(String.valueOf(item.getId()))) {
                    continue;
                }
                
                Map<String, Object> rec = new HashMap<>();
                rec.put("entityId", String.valueOf(item.getId()));
                rec.put("entityName", item.getName());
                rec.put("entityType", "item");
                rec.put("description", item.getDescription());
                rec.put("reason", "场景中的物品");
                rec.put("score", 70.0);
                recommendations.add(rec);
            }
        }
        
        // 2. 基于用户已有的物品推荐
        List<ScenarioItem> userItems = scenarioItemRepository.findByUser_IdAndIsDeletedFalse(userId);
        for (ScenarioItem item : userItems) {
            if (existingEntityIds.contains(String.valueOf(item.getId()))) {
                continue;
            }
            
            Map<String, Object> rec = new HashMap<>();
            rec.put("entityId", String.valueOf(item.getId()));
            rec.put("entityName", item.getName());
            rec.put("entityType", "item");
            rec.put("description", item.getDescription());
            rec.put("reason", "用户已创建的物品");
            rec.put("score", 50.0);
            recommendations.add(rec);
        }
        
        // 按分数排序
        recommendations.sort((a, b) -> {
            double scoreA = ((Number) a.get("score")).doubleValue();
            double scoreB = ((Number) b.get("score")).doubleValue();
            return Double.compare(scoreB, scoreA);
        });
        
        return recommendations.stream().limit(10).collect(Collectors.toList());
    }
    
    /**
     * 关系自动识别
     * 分析Graph中的实体，自动识别可能的关系
     */
    public List<Map<String, Object>> autoDetectRelations(
            List<Map<String, Object>> entities,
            Map<String, Object> context) {
        
        List<Map<String, Object>> detectedRelations = new ArrayList<>();
        
        // 按实体类型分组
        Map<String, List<Map<String, Object>>> entitiesByType = entities.stream()
            .collect(Collectors.groupingBy(e -> (String) e.get("entityType")));
        
        List<Map<String, Object>> characters = entitiesByType.getOrDefault("character", new ArrayList<>());
        List<Map<String, Object>> events = entitiesByType.getOrDefault("event", new ArrayList<>());
        List<Map<String, Object>> items = entitiesByType.getOrDefault("item", new ArrayList<>());
        
        // 1. 角色-角色关系：如果两个角色在同一场景，可能是朋友或对手
        for (int i = 0; i < characters.size(); i++) {
            for (int j = i + 1; j < characters.size(); j++) {
                Map<String, Object> char1 = characters.get(i);
                Map<String, Object> char2 = characters.get(j);
                
                // 检查是否在同一场景
                String char1EraId = (String) char1.get("eraId");
                String char2EraId = (String) char2.get("eraId");
                
                if (char1EraId != null && char1EraId.equals(char2EraId)) {
                    Map<String, Object> relation = new HashMap<>();
                    relation.put("sourceEntityType", "character");
                    relation.put("sourceEntityId", char1.get("entityId"));
                    relation.put("targetEntityType", "character");
                    relation.put("targetEntityId", char2.get("entityId"));
                    relation.put("relationType", "FRIEND");
                    relation.put("strength", 50);
                    relation.put("reason", "同一场景中的角色，建议建立朋友关系");
                    relation.put("confidence", 60.0);
                    detectedRelations.add(relation);
                }
            }
        }
        
        // 2. 角色-场景关系：角色位于场景
        for (Map<String, Object> character : characters) {
            String eraId = (String) character.get("eraId");
            if (eraId != null) {
                Map<String, Object> relation = new HashMap<>();
                relation.put("sourceEntityType", "character");
                relation.put("sourceEntityId", character.get("entityId"));
                relation.put("targetEntityType", "era");
                relation.put("targetEntityId", eraId);
                relation.put("relationType", "LOCATED_IN");
                relation.put("strength", 100);
                relation.put("reason", "角色属于该场景");
                relation.put("confidence", 90.0);
                detectedRelations.add(relation);
            }
        }
        
        // 3. 事件-场景关系：事件发生在场景
        for (Map<String, Object> event : events) {
            String eraId = (String) event.get("eraId");
            if (eraId != null) {
                Map<String, Object> relation = new HashMap<>();
                relation.put("sourceEntityType", "event");
                relation.put("sourceEntityId", event.get("entityId"));
                relation.put("targetEntityType", "era");
                relation.put("targetEntityId", eraId);
                relation.put("relationType", "LOCATED_IN");
                relation.put("strength", 100);
                relation.put("reason", "事件发生在该场景");
                relation.put("confidence", 90.0);
                detectedRelations.add(relation);
            }
        }
        
        // 4. 物品-场景关系：物品位于场景
        for (Map<String, Object> item : items) {
            String eraId = (String) item.get("eraId");
            if (eraId != null) {
                Map<String, Object> relation = new HashMap<>();
                relation.put("sourceEntityType", "item");
                relation.put("sourceEntityId", item.get("entityId"));
                relation.put("targetEntityType", "era");
                relation.put("targetEntityId", eraId);
                relation.put("relationType", "LOCATED_IN");
                relation.put("strength", 100);
                relation.put("reason", "物品位于该场景");
                relation.put("confidence", 90.0);
                detectedRelations.add(relation);
            }
        }
        
        // 按置信度排序
        detectedRelations.sort((a, b) -> {
            double confA = ((Number) a.get("confidence")).doubleValue();
            double confB = ((Number) b.get("confidence")).doubleValue();
            return Double.compare(confB, confA);
        });
        
        return detectedRelations;
    }
    
    /**
     * 流程优化建议
     * 分析Graph结构，提供优化建议
     */
    public List<Map<String, Object>> suggestOptimizations(
            List<Map<String, Object>> nodes,
            List<Map<String, Object>> edges) {
        
        List<Map<String, Object>> suggestions = new ArrayList<>();
        
        // 1. 检查是否有孤立节点（没有连接的节点）
        Set<String> connectedNodeIds = new HashSet<>();
        for (Map<String, Object> edge : edges) {
            connectedNodeIds.add((String) edge.get("sourceNodeId"));
            connectedNodeIds.add((String) edge.get("targetNodeId"));
        }
        
        for (Map<String, Object> node : nodes) {
            String nodeId = (String) node.get("nodeId");
            if (!connectedNodeIds.contains(nodeId) && !"start".equals(node.get("nodeType"))) {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("type", "ISOLATED_NODE");
                suggestion.put("severity", "warning");
                suggestion.put("nodeId", nodeId);
                suggestion.put("message", String.format("节点 %s 没有连接到其他节点", nodeId));
                suggestion.put("suggestion", "考虑将该节点连接到流程中，或删除未使用的节点");
                suggestions.add(suggestion);
            }
        }
        
        // 2. 检查是否有死循环（节点指向自己）
        for (Map<String, Object> edge : edges) {
            String sourceId = (String) edge.get("sourceNodeId");
            String targetId = (String) edge.get("targetNodeId");
            if (sourceId != null && sourceId.equals(targetId)) {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("type", "SELF_LOOP");
                suggestion.put("severity", "warning");
                suggestion.put("nodeId", sourceId);
                suggestion.put("message", String.format("节点 %s 指向自己，可能导致死循环", sourceId));
                suggestion.put("suggestion", "检查节点逻辑，确保有退出条件");
                suggestions.add(suggestion);
            }
        }
        
        // 3. 检查是否有未定义的节点引用
        Set<String> definedNodeIds = nodes.stream()
            .map(n -> (String) n.get("nodeId"))
            .collect(Collectors.toSet());
        
        for (Map<String, Object> edge : edges) {
            String sourceId = (String) edge.get("sourceNodeId");
            String targetId = (String) edge.get("targetNodeId");
            
            if (sourceId != null && !definedNodeIds.contains(sourceId)) {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("type", "UNDEFINED_NODE");
                suggestion.put("severity", "error");
                suggestion.put("nodeId", sourceId);
                suggestion.put("message", String.format("边引用了未定义的节点: %s", sourceId));
                suggestion.put("suggestion", "删除该边或创建对应的节点");
                suggestions.add(suggestion);
            }
            
            if (targetId != null && !definedNodeIds.contains(targetId)) {
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("type", "UNDEFINED_NODE");
                suggestion.put("severity", "error");
                suggestion.put("nodeId", targetId);
                suggestion.put("message", String.format("边引用了未定义的节点: %s", targetId));
                suggestion.put("suggestion", "删除该边或创建对应的节点");
                suggestions.add(suggestion);
            }
        }
        
        // 4. 检查是否有多个开始节点
        long startNodeCount = nodes.stream()
            .filter(n -> "start".equals(n.get("nodeType")))
            .count();
        
        if (startNodeCount > 1) {
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("type", "MULTIPLE_START");
            suggestion.put("severity", "warning");
            suggestion.put("message", String.format("发现 %d 个开始节点，建议只保留一个", startNodeCount));
            suggestion.put("suggestion", "确保Graph只有一个入口点");
            suggestions.add(suggestion);
        }
        
        // 5. 检查是否有结束节点
        long endNodeCount = nodes.stream()
            .filter(n -> "end".equals(n.get("nodeType")))
            .count();
        
        if (endNodeCount == 0) {
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("type", "NO_END_NODE");
            suggestion.put("severity", "warning");
            suggestion.put("message", "Graph没有结束节点");
            suggestion.put("suggestion", "添加结束节点以确保流程可以正常结束");
            suggestions.add(suggestion);
        }
        
        // 6. 检查实体节点的配置完整性
        for (Map<String, Object> node : nodes) {
            String nodeType = (String) node.get("nodeType");
            Map<String, Object> config = (Map<String, Object>) node.get("config");
            
            if (config == null) {
                continue;
            }
            
            switch (nodeType) {
                case "era":
                case "scene":
                    if (config.get("eraId") == null) {
                        Map<String, Object> suggestion = new HashMap<>();
                        suggestion.put("type", "INCOMPLETE_CONFIG");
                        suggestion.put("severity", "warning");
                        suggestion.put("nodeId", node.get("nodeId"));
                        suggestion.put("message", String.format("场景节点 %s 未配置场景ID", node.get("nodeId")));
                        suggestion.put("suggestion", "为场景节点选择具体的场景");
                        suggestions.add(suggestion);
                    }
                    break;
                case "character":
                    if (config.get("characterId") == null) {
                        Map<String, Object> suggestion = new HashMap<>();
                        suggestion.put("type", "INCOMPLETE_CONFIG");
                        suggestion.put("severity", "warning");
                        suggestion.put("nodeId", node.get("nodeId"));
                        suggestion.put("message", String.format("角色节点 %s 未配置角色ID", node.get("nodeId")));
                        suggestion.put("suggestion", "为角色节点选择具体的角色");
                        suggestions.add(suggestion);
                    }
                    break;
                case "event":
                    if (config.get("eventId") == null) {
                        Map<String, Object> suggestion = new HashMap<>();
                        suggestion.put("type", "INCOMPLETE_CONFIG");
                        suggestion.put("severity", "warning");
                        suggestion.put("nodeId", node.get("nodeId"));
                        suggestion.put("message", String.format("事件节点 %s 未配置事件ID", node.get("nodeId")));
                        suggestion.put("suggestion", "为事件节点选择具体的事件");
                        suggestions.add(suggestion);
                    }
                    break;
                case "item":
                    if (config.get("itemId") == null) {
                        Map<String, Object> suggestion = new HashMap<>();
                        suggestion.put("type", "INCOMPLETE_CONFIG");
                        suggestion.put("severity", "warning");
                        suggestion.put("nodeId", node.get("nodeId"));
                        suggestion.put("message", String.format("物品节点 %s 未配置物品ID", node.get("nodeId")));
                        suggestion.put("suggestion", "为物品节点选择具体的物品");
                        suggestions.add(suggestion);
                    }
                    break;
                case "entity_relation":
                case "relation":
                    if (config.get("sourceEntityId") == null || config.get("targetEntityId") == null) {
                        Map<String, Object> suggestion = new HashMap<>();
                        suggestion.put("type", "INCOMPLETE_CONFIG");
                        suggestion.put("severity", "error");
                        suggestion.put("nodeId", node.get("nodeId"));
                        suggestion.put("message", String.format("实体关联节点 %s 未配置源实体或目标实体", node.get("nodeId")));
                        suggestion.put("suggestion", "为实体关联节点配置源实体和目标实体");
                        suggestions.add(suggestion);
                    }
                    break;
            }
        }
        
        return suggestions;
    }
}
