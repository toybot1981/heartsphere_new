package com.heartsphere.heartconnect.portal.dto;

import lombok.Data;

/**
 * 传送请求DTO
 */
@Data
public class TeleportationRequest {
    private Long portalId; // 传送门ID（必填）
    private Boolean skipAnimation; // 是否跳过动画（可选，默认false）
}
