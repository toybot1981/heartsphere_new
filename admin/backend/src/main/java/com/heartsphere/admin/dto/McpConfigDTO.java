package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * MCP 配置 DTO
 */
@Data
public class McpConfigDTO {
    private Long id;
    private String name;
    private String serverType;
    private String serverUrl;
    private String apiKey; // 注意：在显示时应该被掩码
    private Boolean enabled;
    private String description;
    private String extraConfig;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastTestedAt;
    private String connectionStatus;
    private String lastError;
}
