package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 提取配置DTO
 * 
 * @author HeartSphere
 * @date 2025-12-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractionConfigDTO {
    private Boolean enableLLMExtraction;
    private Boolean enableRuleBasedExtraction;
    private Integer batchSize;
    private Integer maxRetries;
    private Map<String, Object> extractionRules;
}


