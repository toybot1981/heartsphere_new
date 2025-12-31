package com.heartsphere.mailbox.dto;

import lombok.Data;

import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * 提醒设置响应DTO
 * 用于避免Hibernate懒加载序列化问题
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class NotificationSettingsResponse {
    private Long id;
    private Long userId;
    private Boolean enableNotifications;
    private Boolean esoulLetterEnabled;
    private Boolean resonanceEnabled;
    private Boolean systemMessageEnabled;
    private Boolean userMessageEnabled;
    private LocalTime quietHoursStart;
    private LocalTime quietHoursEnd;
    private Boolean soundEnabled;
    private LocalDateTime createdAt;
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
}

