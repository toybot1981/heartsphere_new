package com.heartsphere.aiagent.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;

/**
 * OpenAPI兼容的聊天完成响应DTO
 * 与OpenAI/Qwen/Doubao的/chat/completions接口格式保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "OpenAPI兼容的聊天完成响应，格式与OpenAI/Qwen/Doubao的/chat/completions接口一致")
public class ChatCompletionResponse {
    
    @Schema(description = "响应ID", example = "chatcmpl-123")
    private String id;
    
    @Schema(description = "对象类型", example = "chat.completion")
    private String object;
    
    @Schema(description = "创建时间戳", example = "1677652288")
    private Long created;
    
    @Schema(description = "使用的模型", example = "gemini-2.0-flash-exp")
    private String model;
    
    @Schema(description = "选择列表")
    private List<Choice> choices;
    
    @Schema(description = "Token使用量")
    private Usage usage;
    
    /**
     * 选择对象
     */
    @Data
    @Schema(description = "生成的选择项")
    public static class Choice {
        @Schema(description = "索引", example = "0")
        private Integer index;
        
        @Schema(description = "消息对象")
        private ChatMessage message;
        
        @Schema(description = "完成原因", example = "stop")
        private String finish_reason;
    }
    
    /**
     * 聊天消息对象
     */
    @Data
    @Schema(description = "聊天消息")
    public static class ChatMessage {
        @Schema(description = "角色", example = "assistant")
        private String role;
        
        @Schema(description = "消息内容", example = "你好！我是AI助手。")
        private String content;
    }
    
    /**
     * Token使用量
     */
    @Data
    @Schema(description = "Token使用量，格式与OpenAPI规范一致")
    public static class Usage {
        @Schema(description = "提示Token数", example = "100")
        private Integer prompt_tokens;
        
        @Schema(description = "完成Token数", example = "200")
        private Integer completion_tokens;
        
        @Schema(description = "总Token数", example = "300")
        private Integer total_tokens;
    }
}


