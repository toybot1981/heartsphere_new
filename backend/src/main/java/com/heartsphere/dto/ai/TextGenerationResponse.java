package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 文本生成响应DTO
 */
@Data
public class TextGenerationResponse {
    
    /**
     * 生成的文本内容
     */
    private String content;
    
    /**
     * 使用的提供商
     */
    private String provider;
    
    /**
     * 使用的模型
     */
    private String model;
    
    /**
     * Token使用情况
     */
    private TokenUsage usage;
    
    /**
     * 完成原因：stop, length, content_filter等
     */
    private String finishReason;
    
    /**
     * Token使用情况DTO
     */
    @Data
    public static class TokenUsage {
        /**
         * 输入Token数
         */
        private Integer inputTokens;
        
        /**
         * 输出Token数
         */
        private Integer outputTokens;
        
        /**
         * 总Token数
         */
        private Integer totalTokens;
    }
}

