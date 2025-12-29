package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 创建API Key请求
 */
@Data
public class CreateApiKeyRequest {
    private String keyName; // API Key名称（必填）
    private Long userId; // 关联的用户ID（可选）
    private LocalDateTime expiresAt; // 过期时间（可选）
    private Integer rateLimit; // 速率限制（可选）
    private String description; // 描述信息（可选）
}

