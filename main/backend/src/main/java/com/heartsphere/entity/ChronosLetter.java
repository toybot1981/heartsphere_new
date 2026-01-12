package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 跨时空信箱实体（时间信件）
 * 存储用户反馈、管理员回复等信件
 * 注意：与EmailService（真实邮件发送）区分开
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "chronos_letters")
public class ChronosLetter {
    
    @Id
    private String id;
    
    @PrePersist
    public void generateIdAndTimestamp() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = System.currentTimeMillis();
        }
    }
    
    /**
     * 用户ID（收件人）
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * 发件人ID
     * - 如果是用户反馈：可以是角色ID或"user"
     * - 如果是管理员回复：为"admin"
     */
    @Column(name = "sender_id", nullable = false, length = 255)
    private String senderId;
    
    /**
     * 发件人名称
     */
    @Column(name = "sender_name", nullable = false, length = 255)
    private String senderName;
    
    /**
     * 发件人头像URL
     */
    @Column(name = "sender_avatar_url", length = 1000)
    private String senderAvatarUrl;
    
    /**
     * 信件主题
     */
    @Column(nullable = false, length = 500)
    private String subject;
    
    /**
     * 信件内容
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * 时间戳（用于前端显示）
     */
    @Column(nullable = false)
    private Long timestamp;
    
    /**
     * 是否已读
     */
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    /**
     * 主题色（用于前端显示）
     */
    @Column(name = "theme_color", length = 50)
    private String themeColor;
    
    /**
     * 信件类型
     * - user_feedback: 用户反馈
     * - admin_reply: 管理员回复
     * - ai_generated: AI生成的信件（暂不保存）
     */
    @Column(nullable = false, length = 50)
    private String type = "user_feedback";
    
    /**
     * 父信件ID（用于回复）
     * 如果这是回复，指向被回复的信件ID
     */
    @Column(name = "parent_letter_id", length = 255)
    private String parentLetterId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

