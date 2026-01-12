package com.heartsphere.aiagent.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 文本生成响应DTO
 * 与前端types.ts中的TextGenerationResponse接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "文本生成响应，格式与客户端适配器接口一致")
public class TextGenerationResponse {
    
    @Schema(description = "生成的文本内容", example = "你好！我是AI助手，很高兴为你服务。")
    private String content;
    
    @Schema(description = "使用的提供商", example = "gemini")
    private String provider;
    
    @Schema(description = "使用的模型", example = "gemini-2.0-flash-exp")
    private String model;
    
    @Schema(description = "Token使用量")
    private TokenUsage usage;
    
    @Schema(description = "完成原因", example = "stop")
    private String finishReason;
    
    /**
     * Token使用量
     * 与前端types.ts中的TokenUsage接口保持一致
     */
    @Data
    @Schema(description = "Token使用量，格式与客户端适配器接口一致")
    public static class TokenUsage {
        @Schema(description = "输入Token数", example = "100")
        private Integer inputTokens;
        
        @Schema(description = "输出Token数", example = "200")
        private Integer outputTokens;
        
        @Schema(description = "总Token数", example = "300")
        private Integer totalTokens;
    }
}
