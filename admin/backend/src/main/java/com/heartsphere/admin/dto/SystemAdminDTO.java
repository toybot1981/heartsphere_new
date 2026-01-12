package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统管理员数据传输对象
 */
@Data
public class SystemAdminDTO {
    private Long id;
    private String username;
    private String email;
    private String role; // SUPER_ADMIN 或 ADMIN
    private Boolean isActive;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}





