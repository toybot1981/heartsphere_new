package com.heartsphere.memory.entity;

import com.heartsphere.memory.model.FactCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 用户事实实体（MySQL）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_facts", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_user_category", columnList = "user_id,category")
})
public class UserFactEntity {
    
    @Id
    @Column(length = 64)
    private String id;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;
    
    /**
     * 事实内容
     */
    @Column(name = "fact", columnDefinition = "TEXT", nullable = false)
    private String fact;
    
    /**
     * 事实类别
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private FactCategory category;
    
    /**
     * 重要性（0-1）
     */
    @Column(name = "importance", nullable = false)
    @Builder.Default
    private Double importance = 0.5;
    
    /**
     * 置信度（0-1）
     */
    @Column(name = "confidence", nullable = false)
    @Builder.Default
    private Double confidence = 0.7;
    
    /**
     * 来源会话ID
     */
    @Column(name = "source_session_id", length = 64)
    private String sourceSessionId;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 最后访问时间
     */
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
    
    /**
     * 访问次数
     */
    @Column(name = "access_count", nullable = false)
    @Builder.Default
    private Integer accessCount = 0;
    
    /**
     * 标签（JSON数组格式）
     */
    @Column(name = "tags", columnDefinition = "JSON")
    private String tags; // JSON数组字符串
    
    /**
     * 元数据（JSON格式）
     */
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON字符串
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


