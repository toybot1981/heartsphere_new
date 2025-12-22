package com.heartsphere.aiagent.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;

/**
 * OpenAPI兼容的聊天完成请求DTO
 * 与OpenAI/Qwen/Doubao的/chat/completions接口格式保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "OpenAPI兼容的聊天完成请求，格式与OpenAI/Qwen/Doubao的/chat/completions接口一致")
public class ChatCompletionRequest {
    
    @Schema(description = "模型名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "gemini-2.0-flash-exp")
    private String model;
    
    @Schema(description = "消息列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<ChatMessage> messages;
    
    @Schema(description = "温度参数：0-1，默认0.7", example = "0.7")
    private Double temperature;
    
    @Schema(description = "最大输出Token数", example = "2048")
    private Integer max_tokens;
    
    @Schema(description = "是否流式返回，默认false", example = "false")
    private Boolean stream;
    
    @Schema(description = "响应格式（仅OpenAI支持）", example = "{\"type\":\"json_object\"}")
    private ResponseFormat response_format;
    
    /**
     * 聊天消息对象
     */
    @Data
    @Schema(description = "聊天消息，格式与OpenAPI规范一致")
    public static class ChatMessage {
        @Schema(description = "角色：system, user, assistant", example = "user", allowableValues = {"system", "user", "assistant"})
        private String role;
        
        @Schema(description = "消息内容", example = "你好")
        private String content;
    }
    
    /**
     * 响应格式对象
     */
    @Data
    @Schema(description = "响应格式配置")
    public static class ResponseFormat {
        @Schema(description = "格式类型", example = "json_object")
        private String type;
    }
}


