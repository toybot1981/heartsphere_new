package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InviteCodeDTO {
    private Long id;
    private String code;
    private Boolean isUsed;
    private Long usedByUserId;
    private LocalDateTime usedAt;
    private LocalDateTime expiresAt;
    private Long createdByAdminId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



