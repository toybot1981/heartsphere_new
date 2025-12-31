package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 连接请求DTO（管理端）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionRequestDTO {
    
    private Long id;
    
    // 申请用户信息
    private Long requesterId;
    private String requesterUsername;
    private String requesterEmail;
    
    // 目标用户信息
    private Long targetUserId;
    private String targetUsername;
    private String targetUserEmail;
    
    // 共享配置信息
    private Long shareConfigId;
    private String shareCode;
    
    // 请求信息
    private String status; // PENDING/APPROVED/REJECTED/CANCELLED
    private String message; // 申请留言
    private Instant requestTime;
    private Instant processedTime;
    private String processedBy; // 处理人（如果是管理员处理）
    
    // 关联信息
    private Long connectionId; // 如果已批准，关联的连接ID
}



