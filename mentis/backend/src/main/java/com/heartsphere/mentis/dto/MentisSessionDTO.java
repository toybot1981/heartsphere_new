package com.heartsphere.mentis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Mentis会话DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisSessionDTO {
    private Long id;
    private String sessionId;
    private Long userId;
    private String title;
    private String status;
    private String vmStatus;
    private String vmImageId;
    private Map<String, Object> vmConfig;
    private Map<String, Object> context;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActiveAt;
    private Integer taskCount;
    private Integer messageCount;
}
