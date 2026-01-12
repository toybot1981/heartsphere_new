package com.heartsphere.heartconnect.dto;

import lombok.Data;

/**
 * 响应连接请求请求DTO
 */
@Data
public class ResponseConnectionRequestRequest {
    private String action; // "approve", "reject"
    private String responseMessage; // 响应消息（可选）
}

