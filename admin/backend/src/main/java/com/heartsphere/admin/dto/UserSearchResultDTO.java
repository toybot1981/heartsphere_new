package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 用户搜索结果DTO
 * 
 * @author HeartSphere
 * @date 2025-12-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResultDTO {
    private Long userId;
    private String username; // 脱敏后
    private String email; // 脱敏后
    private Long memoryCount; // 记忆数量
    private Instant lastActivityAt; // 最后活动时间
}



