package com.heartsphere.mentis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Mentis任务DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisTaskDTO {
    private Long id;
    private String taskId;
    private String sessionId;
    private String taskType;
    private String status;
    private String description;
    private String command;
    private Map<String, Object> parameters;
    private Map<String, Object> result;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
