package com.heartsphere.admin.dto;

import lombok.Data;

/**
 * 流程执行响应DTO
 */
@Data
public class PipelineExecutionResponse {
    private Long executionId;
    private String status;
    private String message;
}
