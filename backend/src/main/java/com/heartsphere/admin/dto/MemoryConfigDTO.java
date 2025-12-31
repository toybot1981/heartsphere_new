package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 记忆系统配置DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryConfigDTO {
    
    private Long id;
    private String configKey;
    private Object configValue;
    private String configType; // EXTRACTION/RETRIEVAL/CONSOLIDATION/DECAY
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
    private String updatedBy;
}



