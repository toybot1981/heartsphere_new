package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 对话日志实体
 * 用于持久化用户与角色的对话历史，支持软删除和回收站功能
 */
@Data
@Entity
@Table(name = "conversation_logs")
public class ConversationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 用户
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * 用户ID（冗余字段）
     */
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;
    
    /**
     * 角色
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;
    
    /**
     * 角色ID（冗余字段）
     */
    @Column(name = "character_id", insertable = false, updatable = false)
    private Long characterId;
    
    /**
     * 会话ID（唯一标识）
     */
    @Column(name = "session_id", nullable = false, unique = true, length = 255)
    private String sessionId;
    
    /**
     * 角色名称
     */
    @Column(name = "character_name", nullable = false, length = 255)
    private String characterName;
    
    /**
     * 角色头像URL
     */
    @Column(name = "character_avatar_url", length = 500)
    private String characterAvatarUrl;
    
    /**
     * 最后一条消息预览
     */
    @Column(name = "last_message_preview", columnDefinition = "TEXT")
    private String lastMessagePreview;
    
    /**
     * 消息数量
     */
    @Column(name = "message_count", nullable = false)
    private Integer messageCount = 0;
    
    /**
     * 第一条消息时间
     */
    @Column(name = "first_message_at")
    private LocalDateTime firstMessageAt;
    
    /**
     * 最后一条消息时间
     */
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    /**
     * 是否已删除
     */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    /**
     * 删除时间
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 软删除
     */
    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
    
    /**
     * 恢复
     */
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
    }
}

