package com.heartsphere.memory.entity;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
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
 * 用户记忆实体（MySQL）
 * 用于存储长期记忆
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_memories", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_type", columnList = "type"),
    @Index(name = "idx_importance", columnList = "importance"),
    @Index(name = "idx_source", columnList = "source"),
    @Index(name = "idx_source_id", columnList = "source_id"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_user_type", columnList = "user_id,type"),
    @Index(name = "idx_user_importance", columnList = "user_id,importance")
})
public class UserMemoryEntity {
    
    @Id
    @Column(length = 64)
    private String id;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;
    
    /**
     * 记忆类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private MemoryType type;
    
    /**
     * 重要性
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "importance", nullable = false, length = 20)
    private MemoryImportance importance;
    
    /**
     * 记忆内容
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * 结构化数据（JSON格式）
     */
    @Column(name = "structured_data", columnDefinition = "JSON")
    private String structuredData; // JSON字符串，存储Map<String, Object>
    
    /**
     * 记忆来源
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 30)
    private MemorySource source;
    
    /**
     * 来源ID
     */
    @Column(name = "source_id", length = 64)
    private String sourceId;
    
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
     * 提取置信度
     */
    @Column(name = "confidence")
    private Double confidence;
    
    /**
     * 标签（JSON数组格式）
     */
    @Column(name = "tags", columnDefinition = "JSON")
    private String tags; // JSON数组字符串，存储List<String>
    
    /**
     * 扩展元数据（JSON格式）
     */
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON字符串，存储Map<String, Object>
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


