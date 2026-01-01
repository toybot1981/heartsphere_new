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
 * 工作记忆实体（MySQL）
 * 用于存储临时状态数据
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "working_memories", indexes = {
    @Index(name = "idx_session_id", columnList = "session_id"),
    @Index(name = "idx_session_key", columnList = "session_id,memory_key", unique = true),
    @Index(name = "idx_expires_at", columnList = "expires_at")
})
public class WorkingMemoryEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 会话ID
     */
    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;
    
    /**
     * 记忆键
     */
    @Column(name = "memory_key", nullable = false, length = 100)
    private String memoryKey;
    
    /**
     * 记忆值（JSON格式）
     */
    @Column(name = "memory_value", columnDefinition = "TEXT")
    private String memoryValue; // JSON字符串
    
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
     * 过期时间（用于自动清理）
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}


