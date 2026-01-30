package com.heartsphere.admin.dto.cmdb;

import lombok.Data;

/**
 * 关系类型DTO
 */
@Data
public class RelationshipTypeDTO {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean isDirectional;
}
