package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 用户记忆DTO（管理端，脱敏后）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMemoryDTO {
    
    private String id;
    private Long userId;
    private String username; // 脱敏后的用户名
    private String memoryType; // PERSONAL_INFO/PREFERENCE/FACT等
    private String contentPreview; // 内容预览（脱敏后）
    private String importance; // CORE/IMPORTANT/NORMAL/TEMPORARY
    private Instant createdAt;
    private Instant updatedAt;
    private Long accessCount; // 访问次数
}




