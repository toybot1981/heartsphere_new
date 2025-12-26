package com.heartsphere.admin.dto;

import lombok.Data;

/**
 * 创建系统管理员请求DTO
 */
@Data
public class CreateSystemAdminDTO {
    private String username;
    private String password;
    private String email;
    private String role; // SUPER_ADMIN 或 ADMIN
    private Boolean isActive = true;
}


