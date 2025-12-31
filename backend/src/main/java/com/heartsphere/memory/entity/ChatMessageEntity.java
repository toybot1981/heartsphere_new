package com.heartsphere.memory.entity;

import com.heartsphere.memory.model.MessageRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 对话消息实体（MySQL）
 * 用于存储短期记忆（对话上下文）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_session_id", columnList = "session_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_session_timestamp", columnList = "session_id,timestamp")
})
public class ChatMessageEntity {
    
    @Id
    @Column(length = 64)
    private String id;
    
    /**
     * 会话ID
     */
    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;
    
    /**
     * 消息角色（USER/ASSISTANT/SYSTEM）
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private MessageRole role;
    
    /**
     * 消息内容
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * 元数据（JSON格式）
     */
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // JSON字符串，存储Map<String, Object>
    
    /**
     * 时间戳（毫秒）
     */
    @Column(name = "timestamp", nullable = false)
    private Long timestamp;
    
    /**
     * 重要性
     */
    @Column(name = "importance", length = 20)
    private String importance;
    
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

