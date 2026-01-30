package com.heartsphere.admin.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 多智能体协作 DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentCollaborationDTO {
    
    private String collaborationId;
    private String userId;
    private String sessionId;
    private String taskDescription;
    private List<String> agentIds;
    private String status;
    private String workflowMode;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long executionTimeMs;
    private String result;
    private Map<String, Object> agentResults;
    private List<String> errors;
    private Boolean success;
    private LocalDateTime createdAt;
    private String notes;
}
