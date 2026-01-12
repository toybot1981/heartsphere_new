package com.heartsphere.mailbox.entity;

import com.heartsphere.entity.User;
import com.heartsphere.mailbox.enums.ConversationType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 跨时空信箱对话实体
 * 用于存储用户间的对话会话信息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "mailbox_conversations")
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 参与者1
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant1_id", nullable = false)
    private User participant1;
    
    /**
     * 参与者1用户ID（冗余字段）
     */
    @Column(name = "participant1_id", insertable = false, updatable = false)
    private Long participant1Id;
    
    /**
     * 参与者2
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant2_id", nullable = false)
    private User participant2;
    
    /**
     * 参与者2用户ID（冗余字段）
     */
    @Column(name = "participant2_id", insertable = false, updatable = false)
    private Long participant2Id;
    
    /**
     * 对话类型
     */
    @Column(name = "conversation_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ConversationType conversationType;
    
    /**
     * 最后一条消息ID
     */
    @Column(name = "last_message_id")
    private Long lastMessageId;
    
    /**
     * 最后消息时间
     */
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    /**
     * 参与者1的未读数量
     */
    @Column(name = "unread_count_1", nullable = false)
    private Integer unreadCount1 = 0;
    
    /**
     * 参与者1是否置顶
     */
    @Column(name = "is_pinned_1", nullable = false)
    private Boolean isPinned1 = false;
    
    /**
     * 参与者1是否免打扰
     */
    @Column(name = "is_muted_1", nullable = false)
    private Boolean isMuted1 = false;
    
    /**
     * 参与者2的未读数量
     */
    @Column(name = "unread_count_2", nullable = false)
    private Integer unreadCount2 = 0;
    
    /**
     * 参与者2是否置顶
     */
    @Column(name = "is_pinned_2", nullable = false)
    private Boolean isPinned2 = false;
    
    /**
     * 参与者2是否免打扰
     */
    @Column(name = "is_muted_2", nullable = false)
    private Boolean isMuted2 = false;
    
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
     * 获取用户的未读数量
     */
    public Integer getUnreadCount(Long userId) {
        if (participant1Id != null && participant1Id.equals(userId)) {
            return unreadCount1;
        } else if (participant2Id != null && participant2Id.equals(userId)) {
            return unreadCount2;
        }
        return 0;
    }
    
    /**
     * 设置用户的未读数量
     */
    public void setUnreadCount(Long userId, Integer count) {
        if (participant1Id != null && participant1Id.equals(userId)) {
            this.unreadCount1 = count;
        } else if (participant2Id != null && participant2Id.equals(userId)) {
            this.unreadCount2 = count;
        }
    }
    
    /**
     * 增加用户的未读数量
     */
    public void incrementUnreadCount(Long userId) {
        if (participant1Id != null && participant1Id.equals(userId)) {
            this.unreadCount1++;
        } else if (participant2Id != null && participant2Id.equals(userId)) {
            this.unreadCount2++;
        }
    }
    
    /**
     * 清空用户的未读数量
     */
    public void clearUnreadCount(Long userId) {
        setUnreadCount(userId, 0);
    }
    
    /**
     * 获取对话的另一个参与者ID
     */
    public Long getOtherParticipantId(Long userId) {
        if (participant1Id != null && participant1Id.equals(userId)) {
            return participant2Id;
        } else if (participant2Id != null && participant2Id.equals(userId)) {
            return participant1Id;
        }
        return null;
    }
}

