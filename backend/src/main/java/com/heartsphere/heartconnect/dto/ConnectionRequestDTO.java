package com.heartsphere.heartconnect.dto;

import lombok.Data;

/**
 * 连接请求DTO
 */
@Data
public class ConnectionRequestDTO {
    private Long id;
    private Long shareConfigId;
    private Long requesterId;
    private String requesterName;
    private String requesterAvatar;
    private String requestStatus; // "pending", "approved", "rejected", "cancelled"
    private String requestMessage;
    private String responseMessage;
    private Long requestedAt;
    private Long respondedAt;
    private Long expiresAt;
    
    // 共享配置信息
    private ShareConfigDTO shareConfig;
}

