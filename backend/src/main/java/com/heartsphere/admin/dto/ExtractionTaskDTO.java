package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 提取任务DTO
 * 
 * @author HeartSphere
 * @date 2025-12-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractionTaskDTO {
    private String taskId;
    private Long userId;
    private String status; // PENDING/RUNNING/COMPLETED/FAILED
    private Integer extractedCount;
    private Instant createdAt;
    private Instant completedAt;
    private String errorMessage;
}


