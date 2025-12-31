package com.heartsphere.admin.dto;

import lombok.Data;

/**
 * 修改密码请求DTO
 */
@Data
public class ChangePasswordDTO {
    private String oldPassword;
    private String newPassword;
}




