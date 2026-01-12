package com.heartsphere.mailbox.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heartsphere.entity.User;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 跨时空信箱消息实体
 * 存储统一收件箱中的所有消息（E-SOUL来信、共鸣消息、系统消息、用户消息）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "mailbox_messages")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MailboxMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 接收者用户（懒加载，序列化时忽略，使用receiverId）
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User receiver;
    
    /**
     * 接收者用户ID（冗余字段，用于查询）
     */
    @Column(name = "receiver_id", insertable = false, updatable = false)
    private Long receiverId;
    
    /**
     * 发送者类型
     */
    @Column(name = "sender_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SenderType senderType;
    
    /**
     * 发送者ID（E-SOUL ID/心域ID/系统ID/用户ID）
     */
    @Column(name = "sender_id")
    private Long senderId;
    
    /**
     * 发送者名称
     */
    @Column(name = "sender_name", length = 255)
    private String senderName;
    
    /**
     * 发送者头像URL
     */
    @Column(name = "sender_avatar", length = 1000)
    private String senderAvatar;
    
    /**
     * 消息类型
     */
    @Column(name = "message_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    
    /**
     * 消息分类
     */
    @Column(name = "message_category", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private MessageCategory messageCategory;
    
    /**
     * 消息标题
     */
    @Column(name = "title", length = 500)
    private String title;
    
    /**
     * 消息内容
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * 消息扩展数据（JSON格式，用于存储关联内容、元数据、聚合信息等）
     */
    @Column(name = "content_data", columnDefinition = "TEXT")
    private String contentData;
    
    /**
     * 是否已读
     */
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    /**
     * 是否重要
     */
    @Column(name = "is_important", nullable = false)
    private Boolean isImportant = false;
    
    /**
     * 是否收藏
     */
    @Column(name = "is_starred", nullable = false)
    private Boolean isStarred = false;
    
    /**
     * 关联对象ID（如关联的共享配置ID、场景ID等）
     */
    @Column(name = "related_id")
    private Long relatedId;
    
    /**
     * 关联对象类型
     */
    @Column(name = "related_type", length = 50)
    private String relatedType;
    
    /**
     * 回复的消息ID（如果有）
     */
    @Column(name = "reply_to_id")
    private Long replyToId;
    
    /**
     * 阅读时间
     */
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    /**
     * 删除时间（软删除）
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
     * 标记为已读
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
    
    /**
     * 软删除
     */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
    
    /**
     * 是否已删除
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }
}

