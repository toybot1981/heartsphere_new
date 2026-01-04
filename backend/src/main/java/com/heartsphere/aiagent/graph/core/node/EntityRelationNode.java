package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * 实体关联节点（Entity Relation Node）
 * 
 * 用于在Graph中定义和管理实体之间的关系，支持：
 * - 建立/更新实体关系
 * - 检查关系条件
 * - 触发关系相关事件
 * 
 * 配置示例：
 * {
 *   "id": "relation_node_1",
 *   "sourceEntityType": "character",
 *   "sourceEntityId": "character_123",
 *   "targetEntityType": "character",
 *   "targetEntityId": "character_456",
 *   "relationType": "FRIEND",  // FRIEND, ENEMY, ALLY, MENTOR, etc.
 *   "action": "CREATE",  // CREATE, UPDATE, CHECK, DELETE
 *   "strength": 50,      // 关系强度（0-100）
 *   "condition": {       // 可选，关系条件
 *     "type": "favorability",
 *     "operator": ">=",
 *     "value": 30
 *   }
 * }
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityRelationNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 源实体类型（era, character, event, item）
     */
    private String sourceEntityType;
    
    /**
     * 源实体ID
     */
    private String sourceEntityId;
    
    /**
     * 目标实体类型（era, character, event, item）
     */
    private String targetEntityType;
    
    /**
     * 目标实体ID
     */
    private String targetEntityId;
    
    /**
     * 关系类型
     */
    private RelationType relationType;
    
    /**
     * 操作类型
     */
    @Builder.Default
    private RelationAction action = RelationAction.CREATE;
    
    /**
     * 关系强度（0-100）
     */
    @Builder.Default
    private Integer strength = 50;
    
    /**
     * 关系条件（可选）
     */
    private Map<String, Object> condition;
    
    /**
     * 关系类型枚举
     */
    public enum RelationType {
        FRIEND,      // 朋友
        ENEMY,       // 敌人
        ALLY,        // 盟友
        MENTOR,      // 导师
        STUDENT,     // 学生
        LOVER,       // 恋人
        RIVAL,       // 对手
        PARTNER,     // 伙伴
        BELONGS_TO,  // 属于
        OWNS,        // 拥有
        TRIGGERS,    // 触发
        LOCATED_IN,  // 位于
        CUSTOM       // 自定义
    }
    
    /**
     * 关系操作类型枚举
     */
    public enum RelationAction {
        CREATE,      // 创建关系
        UPDATE,      // 更新关系
        CHECK,       // 检查关系
        DELETE,      // 删除关系
        INCREASE,    // 增加关系强度
        DECREASE     // 减少关系强度
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[EntityRelationNode] 执行实体关联节点: {}, 源: {}:{}, 目标: {}:{}, 关系: {}, 操作: {}", 
            id, sourceEntityType, sourceEntityId, targetEntityType, targetEntityId, relationType, action);
        
        // 获取关系存储
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> entityRelations = 
            (Map<String, Map<String, Object>>) state.getData("entity_relations");
        if (entityRelations == null) {
            entityRelations = new java.util.HashMap<>();
            state.setData("entity_relations", entityRelations);
        }
        
        // 构建关系键
        String relationKey = buildRelationKey(sourceEntityType, sourceEntityId, targetEntityType, targetEntityId, relationType);
        
        switch (action) {
            case CREATE:
                // 创建关系
                createRelation(state, entityRelations, relationKey);
                break;
                
            case UPDATE:
                // 更新关系
                updateRelation(state, entityRelations, relationKey);
                break;
                
            case CHECK:
                // 检查关系
                checkRelation(state, entityRelations, relationKey);
                break;
                
            case DELETE:
                // 删除关系
                deleteRelation(state, entityRelations, relationKey);
                break;
                
            case INCREASE:
                // 增加关系强度
                increaseRelationStrength(state, entityRelations, relationKey);
                break;
                
            case DECREASE:
                // 减少关系强度
                decreaseRelationStrength(state, entityRelations, relationKey);
                break;
        }
        
        // 记录节点执行信息
        state.setData("last_relation_node", id);
        state.setData("last_relation_type", relationType.name());
        
        return state;
    }
    
    /**
     * 构建关系键
     */
    private String buildRelationKey(String sourceType, String sourceId, String targetType, String targetId, RelationType type) {
        return String.format("%s:%s->%s:%s:%s", sourceType, sourceId, targetType, targetId, type.name());
    }
    
    /**
     * 创建关系
     */
    private void createRelation(GraphEngine.GraphState state, Map<String, Map<String, Object>> relations, String relationKey) {
        // 检查条件
        if (condition != null && !checkCondition(state)) {
            log.debug("[EntityRelationNode] 关系条件不满足，跳过创建");
            return;
        }
        
        Map<String, Object> relation = new java.util.HashMap<>();
        relation.put("sourceEntityType", sourceEntityType);
        relation.put("sourceEntityId", sourceEntityId);
        relation.put("targetEntityType", targetEntityType);
        relation.put("targetEntityId", targetEntityId);
        relation.put("relationType", relationType.name());
        relation.put("strength", strength);
        relation.put("created", true);
        
        relations.put(relationKey, relation);
        log.debug("[EntityRelationNode] 创建关系: {}", relationKey);
    }
    
    /**
     * 更新关系
     */
    private void updateRelation(GraphEngine.GraphState state, Map<String, Map<String, Object>> relations, String relationKey) {
        Map<String, Object> relation = relations.get(relationKey);
        if (relation == null) {
            log.warn("[EntityRelationNode] 关系不存在，无法更新: {}", relationKey);
            return;
        }
        
        relation.put("strength", strength != null ? strength : 50);
        log.debug("[EntityRelationNode] 更新关系: {}, 强度: {}", relationKey, strength);
    }
    
    /**
     * 检查关系
     */
    private void checkRelation(GraphEngine.GraphState state, Map<String, Map<String, Object>> relations, String relationKey) {
        Map<String, Object> relation = relations.get(relationKey);
        boolean exists = relation != null;
        state.setData("relation_exists_" + relationKey, exists);
        
        if (exists) {
            state.setData("relation_strength_" + relationKey, relation.get("strength"));
        }
        
        log.debug("[EntityRelationNode] 检查关系: {}, 存在: {}", relationKey, exists);
    }
    
    /**
     * 删除关系
     */
    private void deleteRelation(GraphEngine.GraphState state, Map<String, Map<String, Object>> relations, String relationKey) {
        relations.remove(relationKey);
        log.debug("[EntityRelationNode] 删除关系: {}", relationKey);
    }
    
    /**
     * 增加关系强度
     */
    private void increaseRelationStrength(GraphEngine.GraphState state, Map<String, Map<String, Object>> relations, String relationKey) {
        Map<String, Object> relation = relations.get(relationKey);
        if (relation == null) {
            log.warn("[EntityRelationNode] 关系不存在，无法增加强度: {}", relationKey);
            return;
        }
        
        int currentStrength = ((Number) relation.getOrDefault("strength", 50)).intValue();
        int newStrength = Math.min(100, currentStrength + strength);
        relation.put("strength", newStrength);
        log.debug("[EntityRelationNode] 增加关系强度: {} -> {}", currentStrength, newStrength);
    }
    
    /**
     * 减少关系强度
     */
    private void decreaseRelationStrength(GraphEngine.GraphState state, Map<String, Map<String, Object>> relations, String relationKey) {
        Map<String, Object> relation = relations.get(relationKey);
        if (relation == null) {
            log.warn("[EntityRelationNode] 关系不存在，无法减少强度: {}", relationKey);
            return;
        }
        
        int currentStrength = ((Number) relation.getOrDefault("strength", 50)).intValue();
        int newStrength = Math.max(0, currentStrength - strength);
        relation.put("strength", newStrength);
        log.debug("[EntityRelationNode] 减少关系强度: {} -> {}", currentStrength, newStrength);
    }
    
    /**
     * 检查关系条件
     */
    private boolean checkCondition(GraphEngine.GraphState state) {
        if (condition == null || condition.isEmpty()) {
            return true;
        }
        
        String type = (String) condition.get("type");
        String operator = (String) condition.get("operator");
        Object value = condition.get("value");
        
        if (type == null || operator == null || value == null) {
            return true;
        }
        
        switch (type.toLowerCase()) {
            case "favorability":
                return checkFavorabilityCondition(state, operator, value);
            case "skill":
                return checkSkillCondition(state, operator, value);
            case "relation":
                return checkRelationCondition(state, operator, value);
            default:
                return true;
        }
    }
    
    private boolean checkFavorabilityCondition(GraphEngine.GraphState state, String operator, Object value) {
        @SuppressWarnings("unchecked")
        Map<String, Integer> favorability = 
            (Map<String, Integer>) state.getData("character_favorability");
        if (favorability == null) {
            return false;
        }
        int current = favorability.getOrDefault(sourceEntityId, 0);
        int targetValue = ((Number) value).intValue();
        return compareValues(current, operator, targetValue);
    }
    
    private boolean checkSkillCondition(GraphEngine.GraphState state, String operator, Object value) {
        @SuppressWarnings("unchecked")
        Map<String, Integer> skills = 
            (Map<String, Integer>) state.getData("character_skills");
        if (skills == null) {
            return false;
        }
        int current = skills.getOrDefault(sourceEntityId, 0);
        int targetValue = ((Number) value).intValue();
        return compareValues(current, operator, targetValue);
    }
    
    private boolean checkRelationCondition(GraphEngine.GraphState state, String operator, Object value) {
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> relations = 
            (Map<String, Map<String, Object>>) state.getData("entity_relations");
        if (relations == null) {
            return false;
        }
        // 检查是否存在特定关系
        String checkKey = buildRelationKey(sourceEntityType, sourceEntityId, targetEntityType, targetEntityId, relationType);
        boolean exists = relations.containsKey(checkKey);
        if ("has".equals(operator)) {
            return exists;
        } else if ("not_has".equals(operator)) {
            return !exists;
        }
        return false;
    }
    
    private boolean compareValues(int current, String operator, int target) {
        switch (operator) {
            case ">=": return current >= target;
            case "<=": return current <= target;
            case ">": return current > target;
            case "<": return current < target;
            case "==": return current == target;
            case "!=": return current != target;
            default: return false;
        }
    }
}
