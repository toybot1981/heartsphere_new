package com.heartsphere.memory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 角色知识资产实体
 * 用于存储角色从多个用户对话中提升的通用知识
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_knowledge_assets", indexes = {
    @Index(name = "idx_character_type", columnList = "character_id,asset_type"),
    @Index(name = "idx_trust_score", columnList = "trust_score"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_is_approved", columnList = "is_approved")
})
public class CharacterKnowledgeAssetEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 资产类型
     * DOMAIN_KNOWLEDGE - 领域知识
     * INTERACTION_SKILLS - 交互技巧
     * DECISION_RULES - 决策规则
     * EXPERIENCE_PATTERNS - 经验模式
     */
    @Column(name = "asset_type", nullable = false, length = 50)
    private String assetType;
    
    /**
     * 资产标题
     */
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    /**
     * 完整内容
     */
    @Column(name = "content", columnDefinition = "LONGTEXT", nullable = false)
    private String content;
    
    /**
     * 摘要（用于相似度计算）
     */
    @Column(name = "summary", length = 500)
    private String summary;
    
    /**
     * 源对话消息ID
     */
    @Column(name = "source_conversation_id")
    private Long sourceConversationId;
    
    /**
     * 信任度评分 (0-100)
     */
    @Column(name = "trust_score")
    private Integer trustScore;
    
    /**
     * 被使用次数
     */
    @Column(name = "usage_count")
    private Integer usageCount;
    
    /**
     * 正面评价数
     */
    @Column(name = "positive_feedback_count")
    private Integer positiveFeedbackCount;
    
    /**
     * 负面评价数
     */
    @Column(name = "negative_feedback_count")
    private Integer negativeFeedbackCount;
    
    /**
     * 是否自动升级
     */
    @Column(name = "is_auto_promoted")
    private Boolean isAutoPromoted;
    
    /**
     * 是否通过审核
     */
    @Column(name = "is_approved")
    private Boolean isApproved;
    
    /**
     * 审核者ID
     */
    @Column(name = "approved_by", length = 64)
    private String approvedBy;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 最后使用时间
     */
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
}
