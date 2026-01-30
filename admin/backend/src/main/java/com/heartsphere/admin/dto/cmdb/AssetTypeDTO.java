package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

/**
 * 资产类型DTO
 */
@Data
public class AssetTypeDTO {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String icon;
    private String attributesSchema; // JSON格式
}
