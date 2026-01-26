package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 记忆提取配置DTO
 * 
 * @author HeartSphere
 * @date 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractionConfigDTO {
    
    private Boolean enableLLMExtraction; // 是否启用LLM提取
    private Boolean enableRuleBasedExtraction; // 是否启用基于规则的提取
    private Integer batchSize; // 批处理大小
    private Integer maxRetries; // 最大重试次数
    private Map<String, Object> extractionRules; // 提取规则
}
