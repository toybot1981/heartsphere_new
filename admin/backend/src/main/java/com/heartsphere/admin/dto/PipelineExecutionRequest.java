package com.heartsphere.admin.dto;

import lombok.Data;

import java.util.Map;

/**
 * 流程执行请求DTO
 */
@Data
public class PipelineExecutionRequest {
    /**
     * 流程模板ID
     */
    private Long pipelineId;
    
    /**
     * 流程参数（覆盖步骤参数）
     */
    private Map<String, Object> parameters;
    
    /**
     * 是否跳过某些步骤（步骤ID列表）
     */
    private java.util.List<Long> skipSteps;
    
    /**
     * 环境变量（覆盖解析的环境变量）
     */
    private Map<String, String> environmentVariables;
}
