package com.heartsphere.dto.ai;

import lombok.Data;
import java.util.List;

/**
 * 文本生成请求DTO
 */
@Data
public class TextGenerationRequest {
    
    /**
     * 提供商：gemini, openai, qwen, doubao
     * 可选，不指定则使用用户配置
     */
    private String provider;
    
    /**
     * 模型名称
     * 可选，不指定则使用默认模型
     */
    private String model;
    
    /**
     * 用户输入的文本提示
     */
    private String prompt;
    
    /**
     * 系统指令（可选）
     */
    private String systemInstruction;
    
    /**
     * 对话历史消息（可选）
     */
    private List<Message> messages;
    
    /**
     * 温度参数：0-1，默认0.7
     * 控制生成的随机性
     */
    private Double temperature;
    
    /**
     * 最大输出Token数
     */
    private Integer maxTokens;
    
    /**
     * 是否流式返回，默认false
     */
    private Boolean stream;
    
    /**
     * 消息DTO
     */
    @Data
    public static class Message {
        /**
         * 角色：user, assistant, system
         */
        private String role;
        
        /**
         * 消息内容
         */
        private String content;
    }
}

