package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 资产DTO
 */
@Data
public class AssetDTO {
    private Long id;
    private String name;
    private AssetTypeDTO type;
    private String status;
    private String version;
    private String location;
    private Long ownerId;
    private String ownerName;
    private String description;
    private String attributes; // JSON格式
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
