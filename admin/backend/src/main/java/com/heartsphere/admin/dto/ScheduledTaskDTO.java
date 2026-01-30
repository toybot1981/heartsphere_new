package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 定时任务 DTO
 */
@Data
public class ScheduledTaskDTO {
    private Long id;
    private String name;
    private String scriptId;
    private String scriptName;
    private String cronExpression;
    private Boolean enabled;
    private String parameters;
    private LocalDateTime lastExecutedAt;
    private LocalDateTime nextExecutionTime;
    private Long executionCount;
    private Long successCount;
    private Long failureCount;
}
