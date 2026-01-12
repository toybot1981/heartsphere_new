package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Mentis Agent 配置 DTO
 */
@Data
public class MentisAgentConfigDTO {
    private Long id;
    private Long agentId; // 引用 main 系统的 character ID
    private String agentName;
    private Map<String, Object> configuration; // JSON 配置
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
