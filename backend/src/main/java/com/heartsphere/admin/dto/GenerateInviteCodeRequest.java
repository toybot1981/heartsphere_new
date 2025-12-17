package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GenerateInviteCodeRequest {
    private Integer quantity; // 生成数量
    private LocalDateTime expiresAt; // 过期时间
}



