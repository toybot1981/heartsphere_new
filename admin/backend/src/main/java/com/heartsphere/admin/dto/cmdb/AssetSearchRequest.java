package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

/**
 * 资产搜索请求DTO
 */
@Data
public class AssetSearchRequest {
    private String name;
    private Long typeId;
    private String status;
    private Long ownerId;
    private Integer page = 0;
    private Integer size = 20;
}
