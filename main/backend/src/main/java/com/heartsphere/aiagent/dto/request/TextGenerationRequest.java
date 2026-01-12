package com.heartsphere.aiagent.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;

/**
 * 文本生成请求DTO
 * 与前端types.ts中的TextGenerationRequest接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "文本生成请求，格式与客户端适配器接口一致")
public class TextGenerationRequest {
    
    @Schema(description = "提供商（可选）：gemini, openai, qwen, doubao。如果不指定，使用用户配置或系统默认", example = "gemini")
    private String provider;
    
    @Schema(description = "模型名称（可选）。如果不指定，使用提供商默认模型", example = "gemini-2.0-flash-exp")
    private String model;
    
    @Schema(description = "提示词（用户输入）", requiredMode = Schema.RequiredMode.REQUIRED, example = "你好，请介绍一下你自己")
    private String prompt;
    
    @Schema(description = "系统指令（可选）", example = "你是一个友好的助手")
    private String systemInstruction;
    
    @Schema(description = "对话历史（可选）", example = "[{\"role\":\"user\",\"content\":\"你好\"},{\"role\":\"assistant\",\"content\":\"你好！有什么可以帮助你的吗？\"}]")
    private List<Message> messages;
    
    @Schema(description = "温度参数：0-1，默认0.7", example = "0.7")
    private Double temperature;
    
    @Schema(description = "最大输出Token数", example = "2048")
    private Integer maxTokens;
    
    @Schema(description = "是否流式返回，默认false", example = "false")
    private Boolean stream;
    
    @Schema(description = "API基础URL（可选，用于统一接入模式）", example = "https://dashscope.aliyuncs.com/compatible-mode/v1")
    private String baseUrl; // API基础URL，从配置表中获取
    
    @Schema(description = "API密钥（可选，用于统一接入模式，从模型配置表获取）", example = "sk-xxx")
    private String apiKey; // API密钥，从配置表中获取
    
    /**
     * 消息对象
     * 与前端types.ts中的Message接口保持一致
     */
    @Data
    @Schema(description = "消息对象，格式与客户端适配器接口一致")
    public static class Message {
        @Schema(description = "角色：user, assistant, system", example = "user", allowableValues = {"user", "assistant", "system"})
        private String role;
        
        @Schema(description = "消息内容", example = "你好")
        private String content;
    }
}
