package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 管理员用户管理数据传输对象
 */
@Data
public class AdminUserDTO {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String avatar;
    private String wechatOpenid;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 统计信息（可选）
    private Long journalCount;
    private Long characterCount;
    private Long eraCount;
}


