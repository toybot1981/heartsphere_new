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
 * 会话实体（MySQL）
 * 用于管理会话索引
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "memory_sessions", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_session_id", columnList = "session_id", unique = true),
    @Index(name = "idx_updated_at", columnList = "updated_at")
})
public class SessionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 会话ID
     */
    @Column(name = "session_id", nullable = false, unique = true, length = 64)
    private String sessionId;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;
    
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

