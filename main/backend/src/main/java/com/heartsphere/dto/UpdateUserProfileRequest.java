package com.heartsphere.dto;

import lombok.Data;
import jakarta.validation.constraints.Size;

/**
 * 更新用户资料请求DTO
 */
@Data
public class UpdateUserProfileRequest {
    
    @Size(max = 50, message = "昵称长度不能超过50个字符")
    private String nickname;
    
    @Size(max = 500, message = "头像URL长度不能超过500个字符")
    private String avatar;
}




