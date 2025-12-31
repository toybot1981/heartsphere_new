package com.heartsphere.mailbox.entity;

import com.heartsphere.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * 跨时空信箱提醒设置实体
 * 用于存储用户的提醒偏好设置
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "mailbox_notification_settings")
public class NotificationSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 用户
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;
    
    /**
     * 用户ID（冗余字段，用于序列化）
     */
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;
    
    /**
     * 是否启用提醒
     */
    @Column(name = "enable_notifications", nullable = false)
    private Boolean enableNotifications = true;
    
    /**
     * E-SOUL来信提醒
     */
    @Column(name = "esoul_letter_enabled", nullable = false)
    private Boolean esoulLetterEnabled = true;
    
    /**
     * 共鸣消息提醒
     */
    @Column(name = "resonance_enabled", nullable = false)
    private Boolean resonanceEnabled = true;
    
    /**
     * 系统消息提醒
     */
    @Column(name = "system_message_enabled", nullable = false)
    private Boolean systemMessageEnabled = true;
    
    /**
     * 用户消息提醒
     */
    @Column(name = "user_message_enabled", nullable = false)
    private Boolean userMessageEnabled = true;
    
    /**
     * 免打扰开始时间
     */
    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart;
    
    /**
     * 免打扰结束时间
     */
    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd;
    
    /**
     * 是否启用声音
     */
    @Column(name = "sound_enabled", nullable = false)
    private Boolean soundEnabled = true;
    
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
     * 检查是否在免打扰时间
     */
    public boolean isQuietHours() {
        if (quietHoursStart == null || quietHoursEnd == null) {
            return false;
        }
        
        LocalTime now = LocalTime.now();
        
        // 处理跨天的情况（如 22:00 - 08:00）
        if (quietHoursStart.isAfter(quietHoursEnd)) {
            return now.isAfter(quietHoursStart) || now.isBefore(quietHoursEnd);
        } else {
            return now.isAfter(quietHoursStart) && now.isBefore(quietHoursEnd);
        }
    }
    
    /**
     * 检查指定消息类型是否启用提醒
     */
    public boolean isEnabledForCategory(String category) {
        if (!enableNotifications) {
            return false;
        }
        
        if (isQuietHours()) {
            return false;
        }
        
        return switch (category) {
            case "esoul_letter" -> esoulLetterEnabled;
            case "resonance" -> resonanceEnabled;
            case "system" -> systemMessageEnabled;
            case "user_message" -> userMessageEnabled;
            default -> true;
        };
    }
}

