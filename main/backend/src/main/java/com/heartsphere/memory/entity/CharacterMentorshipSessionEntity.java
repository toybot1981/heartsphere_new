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
 * 角色导师指导会话实体
 * 用于记录角色的导师指导会话，包括主动指导、个性化教育、成长规划等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_mentorship_sessions", indexes = {
    @Index(name = "idx_character_user_time", columnList = "character_id,user_id,started_at"),
    @Index(name = "idx_session_type", columnList = "session_type"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
public class CharacterMentorshipSessionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    /**
     * 会话类型
     * ACTIVE_GUIDANCE - 主动指导
     * PERSONALIZED_EDUCATION - 个性化教育
     * GROWTH_PLANNING - 成长规划
     */
    @Column(name = "session_type", nullable = false, length = 50)
    private String sessionType;
    
    /**
     * 会话标题
     */
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    /**
     * 指导内容
     */
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;
    
    /**
     * 学习目标（JSON格式）
     */
    @Column(name = "learning_objectives", columnDefinition = "JSON")
    private String learningObjectives;
    
    /**
     * 用户进度（JSON格式）
     */
    @Column(name = "user_progress", columnDefinition = "JSON")
    private String userProgress;
    
    /**
     * 效果评分 (0-100)
     */
    @Column(name = "effectiveness_score")
    private Integer effectivenessScore;
    
    /**
     * 用户反馈
     */
    @Column(name = "user_feedback", columnDefinition = "TEXT")
    private String userFeedback;
    
    /**
     * 状态
     * ACTIVE - 进行中
     * COMPLETED - 已完成
     * ARCHIVED - 已归档
     */
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";
    
    /**
     * 开始时间
     */
    @Column(name = "started_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime startedAt;
    
    /**
     * 完成时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
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
}
