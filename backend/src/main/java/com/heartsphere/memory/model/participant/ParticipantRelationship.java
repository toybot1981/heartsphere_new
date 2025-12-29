package com.heartsphere.memory.model.participant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 参与者关系
 * 存储参与者之间的关系类型、强度、历史等
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "participant_relationships")
public class ParticipantRelationship {
    
    @Id
    private String id;
    
    /**
     * 参与者ID
     */
    private String participantId;
    
    /**
     * 关联的参与者ID
     */
    private String relatedParticipantId;
    
    /**
     * 场景ID（可选）
     */
    private String sceneId;
    
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
    private List<InteractionRecord> interactions;
    
    /**
     * 交互次数
     */
    private Integer interactionCount;
    
    /**
     * 首次相遇时间
     */
    private Instant firstMetAt;
    
    /**
     * 最后交互时间
     */
    private Instant lastInteractedAt;
    
    /**
     * 关系变化历史
     */
    private List<RelationshipChange> relationshipHistory;
    
    /**
     * 创建时间
     */
    private Instant createdAt;
    
    /**
     * 更新时间
     */
    private Instant updatedAt;
    
    /**
     * 元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 关系类型枚举
     */
    public enum RelationshipType {
        FRIEND,        // 朋友
        COLLEAGUE,     // 同事
        PARTNER,       // 合作伙伴
        RIVAL,         // 对手
        MENTOR,        // 导师
        STUDENT,       // 学生
        FAMILY,        // 家人
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
        private String interactionId;
        private String interactionType;
        private Instant interactionTime;
        private String description;
    }
    
    /**
     * 关系变化记录
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipChange {
        private Double oldStrength;
        private Double newStrength;
        private RelationshipType oldType;
        private RelationshipType newType;
        private Instant timestamp;
        private String reason;
    }
}

