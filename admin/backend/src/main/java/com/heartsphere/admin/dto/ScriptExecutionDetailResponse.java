package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 脚本执行详情响应 DTO（包含日志内容）
 */
@Data
public class ScriptExecutionDetailResponse {
    private Long id;
    private String scriptId;
    private String scriptName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationSeconds;
    private Integer exitCode;
    private String error;
    private String parameters;
    private String logContent; // 完整日志内容
}
