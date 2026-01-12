package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.EntityRelation;
import com.heartsphere.admin.repository.EntityRelationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 实体关系管理服务
 * 提供实体关系的创建、查询、推荐等功能
 */
@Slf4j
@Service
public class EntityRelationService {
    
    @Autowired
    private EntityRelationRepository relationRepository;
    
    /**
     * 创建实体关系
     */
    @Transactional
    public EntityRelation createRelation(
            String sourceEntityType, String sourceEntityId,
            String targetEntityType, String targetEntityId,
            String relationType, Integer strength, Long userId) {
        
        // 检查关系是否已存在
        Optional<EntityRelation> existing = relationRepository.findSpecificRelation(
            sourceEntityType, sourceEntityId,
            targetEntityType, targetEntityId,
            relationType
        );
        
        if (existing.isPresent()) {
            // 更新现有关系
            EntityRelation relation = existing.get();
            if (strength != null) {
                relation.setStrength(strength);
            }
            return relationRepository.save(relation);
        }
        
        // 创建新关系
        EntityRelation relation = new EntityRelation();
        relation.setSourceEntityType(sourceEntityType);
        relation.setSourceEntityId(sourceEntityId);
        relation.setTargetEntityType(targetEntityType);
        relation.setTargetEntityId(targetEntityId);
        relation.setRelationType(relationType);
        relation.setStrength(strength != null ? strength : 50);
        if (userId != null) {
            relation.setUser(new com.heartsphere.admin.entity.User());
            relation.getUser().setId(userId);
        }
        
        return relationRepository.save(relation);
    }
    
    /**
     * 查询实体的所有关系
     */
    public List<EntityRelation> getEntityRelations(String entityType, String entityId) {
        List<EntityRelation> relations = new ArrayList<>();
        
        // 作为源实体的关系
        relations.addAll(relationRepository.findBySourceEntity(entityType, entityId));
        
        // 作为目标实体的关系
        relations.addAll(relationRepository.findByTargetEntity(entityType, entityId));
        
        return relations;
    }
    
    /**
     * 查询两个实体之间的关系
     */
    public List<EntityRelation> getRelationsBetween(
            String sourceType, String sourceId,
            String targetType, String targetId) {
        return relationRepository.findRelationBetween(sourceType, sourceId, targetType, targetId);
    }
    
    /**
     * 推荐相关实体
     * 基于现有关系推荐可能与指定实体相关的其他实体
     */
    public List<Map<String, Object>> recommendRelatedEntities(String entityType, String entityId, int limit) {
        List<EntityRelation> relations = getEntityRelations(entityType, entityId);
        
        // 统计实体出现频率和关系强度
        Map<String, Map<String, Object>> entityStats = new HashMap<>();
        
        for (EntityRelation relation : relations) {
            String relatedEntityType;
            String relatedEntityId;
            
            // 确定关联的实体
            if (relation.getSourceEntityType().equals(entityType) && 
                relation.getSourceEntityId().equals(entityId)) {
                relatedEntityType = relation.getTargetEntityType();
                relatedEntityId = relation.getTargetEntityId();
            } else {
                relatedEntityType = relation.getSourceEntityType();
                relatedEntityId = relation.getSourceEntityId();
            }
            
            String key = relatedEntityType + ":" + relatedEntityId;
            Map<String, Object> stats = entityStats.computeIfAbsent(key, k -> {
                Map<String, Object> s = new HashMap<>();
                s.put("entityType", relatedEntityType);
                s.put("entityId", relatedEntityId);
                s.put("totalStrength", 0);
                s.put("relationCount", 0);
                s.put("relationTypes", new HashSet<String>());
                return s;
            });
            
            // 累计关系强度
            int currentStrength = stats.get("totalStrength") != null ? 
                ((Number) stats.get("totalStrength")).intValue() : 0;
            stats.put("totalStrength", currentStrength + (relation.getStrength() != null ? relation.getStrength() : 50));
            
            // 增加关系计数
            int count = stats.get("relationCount") != null ? 
                ((Number) stats.get("relationCount")).intValue() : 0;
            stats.put("relationCount", count + 1);
            
            // 记录关系类型
            @SuppressWarnings("unchecked")
            Set<String> types = (Set<String>) stats.get("relationTypes");
            types.add(relation.getRelationType());
        }
        
        // 按关系强度排序并返回
        return entityStats.values().stream()
            .sorted((a, b) -> {
                int strengthA = ((Number) a.get("totalStrength")).intValue();
                int strengthB = ((Number) b.get("totalStrength")).intValue();
                return Integer.compare(strengthB, strengthA); // 降序
            })
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * 推荐可能的关系
     * 基于实体属性和上下文推荐可能的关系
     */
    public List<Map<String, Object>> recommendPossibleRelations(
            String sourceType, String sourceId,
            String targetType, String targetId) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // 检查是否已有关系
        List<EntityRelation> existing = getRelationsBetween(sourceType, sourceId, targetType, targetId);
        Set<String> existingTypes = existing.stream()
            .map(EntityRelation::getRelationType)
            .collect(Collectors.toSet());
        
        // 根据实体类型推荐关系
        if ("character".equals(sourceType) && "character".equals(targetType)) {
            // 角色-角色关系
            if (!existingTypes.contains("FRIEND")) {
                recommendations.add(createRecommendation("FRIEND", "朋友关系", 30));
            }
            if (!existingTypes.contains("ENEMY")) {
                recommendations.add(createRecommendation("ENEMY", "敌对关系", 20));
            }
            if (!existingTypes.contains("ALLY")) {
                recommendations.add(createRecommendation("ALLY", "盟友关系", 25));
            }
            if (!existingTypes.contains("RIVAL")) {
                recommendations.add(createRecommendation("RIVAL", "对手关系", 20));
            }
        } else if ("character".equals(sourceType) && "era".equals(targetType)) {
            // 角色-场景关系
            if (!existingTypes.contains("LOCATED_IN")) {
                recommendations.add(createRecommendation("LOCATED_IN", "位于场景", 50));
            }
        } else if ("character".equals(sourceType) && "item".equals(targetType)) {
            // 角色-物品关系
            if (!existingTypes.contains("OWNS")) {
                recommendations.add(createRecommendation("OWNS", "拥有物品", 50));
            }
        } else if ("event".equals(sourceType) && "era".equals(targetType)) {
            // 事件-场景关系
            if (!existingTypes.contains("LOCATED_IN")) {
                recommendations.add(createRecommendation("LOCATED_IN", "事件发生在场景", 50));
            }
        } else if ("item".equals(sourceType) && "era".equals(targetType)) {
            // 物品-场景关系
            if (!existingTypes.contains("LOCATED_IN")) {
                recommendations.add(createRecommendation("LOCATED_IN", "物品位于场景", 50));
            }
        } else if ("event".equals(sourceType) && "character".equals(targetType)) {
            // 事件-角色关系
            if (!existingTypes.contains("TRIGGERS")) {
                recommendations.add(createRecommendation("TRIGGERS", "事件触发角色", 40));
            }
        }
        
        return recommendations;
    }
    
    private Map<String, Object> createRecommendation(String relationType, String description, int defaultStrength) {
        Map<String, Object> rec = new HashMap<>();
        rec.put("relationType", relationType);
        rec.put("description", description);
        rec.put("defaultStrength", defaultStrength);
        return rec;
    }
    
    /**
     * 删除关系
     */
    @Transactional
    public void deleteRelation(Long relationId) {
        relationRepository.deleteById(relationId);
    }
    
    /**
     * 更新关系强度
     */
    @Transactional
    public EntityRelation updateRelationStrength(Long relationId, Integer strength) {
        EntityRelation relation = relationRepository.findById(relationId)
            .orElseThrow(() -> new RuntimeException("关系不存在: " + relationId));
        relation.setStrength(Math.max(0, Math.min(100, strength)));
        return relationRepository.save(relation);
    }
}
