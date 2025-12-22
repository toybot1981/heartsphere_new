package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AI模型配置DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIModelConfigDTO {
    private Long id;
    private String provider; // 提供商：gemini, openai, qwen, doubao
    private String modelName; // 模型名称
    private String capability; // 能力类型：text, image, audio, video
    private String apiKey; // API密钥（显示时部分隐藏）
    private String baseUrl; // API基础URL
    private String modelParams; // 模型参数（JSON格式）
    private Boolean isDefault; // 是否为默认模型
    private Integer priority; // 优先级
    private Double costPerToken; // 每token成本
    private Boolean isActive; // 是否启用
    private String description; // 描述
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


