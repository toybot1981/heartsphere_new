package com.heartsphere.admin.dto;

import lombok.Data;
import java.util.Map;

/**
 * 脚本执行请求 DTO
 */
@Data
public class ScriptExecutionRequest {
    private String scriptId;
    private Map<String, Object> parameters;
    private Map<String, String> environmentVariables;
}
