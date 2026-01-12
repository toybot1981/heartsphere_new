package com.heartsphere.heartconnect.dto;

import lombok.Data;

/**
 * 创建连接请求请求DTO
 */
@Data
public class CreateConnectionRequestRequest {
    private String shareCode; // 共享码
    private String requestMessage; // 请求消息（可选）
}

