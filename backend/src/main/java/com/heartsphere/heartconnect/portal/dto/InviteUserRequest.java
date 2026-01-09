package com.heartsphere.heartconnect.portal.dto;

import lombok.Data;

/**
 * 邀请用户请求DTO
 */
@Data
public class InviteUserRequest {
    private Long userId;
    private String message;
}
