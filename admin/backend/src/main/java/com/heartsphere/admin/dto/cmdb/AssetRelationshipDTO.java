package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 资产关系DTO
 */
@Data
public class AssetRelationshipDTO {
    private Long id;
    private Long sourceAssetId;
    private String sourceAssetName;
    private Long targetAssetId;
    private String targetAssetName;
    private RelationshipTypeDTO relationshipType;
    private String properties; // JSON格式
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
