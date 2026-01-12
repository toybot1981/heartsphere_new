package com.heartsphere.mentis.ai.dto.response;

import lombok.Data;

/**
 * 文本生成响应DTO
 * 临时实现，用于 mentis 后端编译
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class TextGenerationResponse {
    private String content;
    private String provider;
    private String model;
    private TokenUsage usage;
    private String finishReason;
    
    @Data
    public static class TokenUsage {
        private Integer inputTokens;
        private Integer outputTokens;
        private Integer totalTokens;
    }
}
