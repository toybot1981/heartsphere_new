package com.heartsphere.mailbox.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 跨时空信箱对话消息实体
 * 用于存储用户间对话的具体消息内容
 * 注意：对话消息不在 mailbox_messages 表中显示，只在对话界面显示
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "mailbox_conversation_messages")
public class ConversationMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 所属对话
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    /**
     * 对话ID（冗余字段）
     */
    @Column(name = "conversation_id", insertable = false, updatable = false)
    private Long conversationId;
    
    /**
     * 发送者ID
     */
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    /**
     * 发送者类型
     */
    @Column(name = "sender_type", nullable = false, length = 50)
    private String senderType; // "user" 或 "system"
    
    /**
     * 消息类型
     */
    @Column(name = "message_type", nullable = false, length = 50)
    private String messageType; // "text", "image", "voice", "emoji"等
    
    /**
     * 消息内容
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * 消息扩展数据（JSON格式，用于存储图片URL、语音URL等）
     */
    @Column(name = "content_data", columnDefinition = "TEXT")
    private String contentData;
    
    /**
     * 回复的消息ID（如果有）
     */
    @Column(name = "reply_to_id")
    private Long replyToId;
    
    /**
     * 是否已编辑
     */
    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;
    
    /**
     * 是否已删除
     */
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
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
     * 标记为已编辑
     */
    public void markAsEdited() {
        this.isEdited = true;
    }
    
    /**
     * 软删除
     */
    public void softDelete() {
        this.isDeleted = true;
    }
}

