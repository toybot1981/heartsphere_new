package com.heartsphere.admin.dto;

import lombok.Data;

/**
 * 更新系统管理员请求DTO
 */
@Data
public class UpdateSystemAdminDTO {
    private String email;
    private String role; // SUPER_ADMIN 或 ADMIN
    private Boolean isActive;
}




