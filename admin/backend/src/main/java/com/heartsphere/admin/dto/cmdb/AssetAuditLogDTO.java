package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 资产审计日志DTO
 */
@Data
public class AssetAuditLogDTO {
    private Long id;
    private Long assetId;
    private String assetName;
    private String operation;
    private Long operatorId;
    private String operatorName;
    private String details; // JSON格式
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
