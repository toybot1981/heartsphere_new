package com.heartsphere.memory.model.character;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 角色关系记忆
 * 存储角色与其他角色的关系信息
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "character_relationship_memories")
public class CharacterRelationshipMemory {
    
    @Id
    private String id;
    
    /**
     * 角色ID
     */
    private String characterId;
    
    /**
     * 关联的角色ID
     */
    private String relatedCharacterId;
    
    /**
     * 关系类型
     */
    private RelationshipType relationshipType;
    
    /**
     * 关系强度 (0.0-1.0)
     */
    private Double strength;
    
    /**
     * 关系描述
     */
    private String description;
    
    /**
     * 交互记录
     */
    @Builder.Default
    private List<InteractionRecord> interactions = new ArrayList<>();
    
    /**
     * 交互次数
     */
    private Integer interactionCount;
    
    /**
     * 首次交互时间
     */
    private Instant firstMetAt;
    
    /**
     * 最后交互时间
     */
    private Instant lastInteractedAt;
    
    /**
     * 关系变化历史
     */
    @Builder.Default
    private List<RelationshipChange> relationshipHistory = new ArrayList<>();
    
    /**
     * 创建时间
     */
    private Instant createdAt;
    
    /**
     * 更新时间
     */
    private Instant updatedAt;
    
    /**
     * 扩展元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 关系类型枚举
     */
    public enum RelationshipType {
        FRIEND,        // 朋友
        FAMILY,        // 家人
        COLLEAGUE,     // 同事
        ENEMY,         // 敌人
        MENTOR,        // 导师
        STUDENT,       // 学生
        LOVER,         // 恋人
        ACQUAINTANCE,  // 熟人
        UNKNOWN        // 未知
    }
    
    /**
     * 交互记录
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InteractionRecord {
        /**
         * 交互ID
         */
        private String interactionId;
        
        /**
         * 交互类型
         */
        private InteractionType type;
        
        /**
         * 交互描述
         */
        private String description;
        
        /**
         * 交互时间
         */
        private Instant timestamp;
        
        /**
         * 扩展元数据
         */
        private Map<String, Object> metadata;
        
        /**
         * 交互类型枚举
         */
        public enum InteractionType {
            CONVERSATION,  // 对话
            ACTION,        // 操作
            EVENT,         // 事件
            EMOTION        // 情感
        }
    }
    
    /**
     * 关系变化记录
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipChange {
        /**
         * 旧的关系类型
         */
        private RelationshipType oldType;
        
        /**
         * 新的关系类型
         */
        private RelationshipType newType;
        
        /**
         * 旧的关系强度
         */
        private Double oldStrength;
        
        /**
         * 新的关系强度
         */
        private Double newStrength;
        
        /**
         * 变化原因
         */
        private String reason;
        
        /**
         * 变化时间
         */
        private Instant timestamp;
    }
}

