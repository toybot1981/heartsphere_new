package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 会话信息DTO（管理端）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionInfoDTO {
    
    private String sessionId;
    private Long userId;
    private String username; // 脱敏后的用户名
    private Instant createdAt;
    private Instant lastActivityAt;
    private Integer messageCount; // 消息数量
    private String status; // ACTIVE/EXPIRED/CLOSED
    private Instant expiresAt;
    private Long durationSeconds; // 会话时长（秒）
}




