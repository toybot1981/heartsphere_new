package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 脚本执行响应 DTO
 */
@Data
public class ScriptExecutionResponse {
    private Long id;
    private String scriptId;
    private String scriptName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationSeconds;
    private Integer exitCode;
    private String error;
}
