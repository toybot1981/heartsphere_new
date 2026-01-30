package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 资产历史DTO
 */
@Data
public class AssetHistoryDTO {
    private Long id;
    private Long assetId;
    private String assetName;
    private String action;
    private Long changedBy;
    private String changedByName;
    private String oldValue; // JSON格式
    private String newValue; // JSON格式
    private String changeSummary;
    private LocalDateTime timestamp;
}
