package com.heartsphere.memory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 对话消息模型
 * 用于短期记忆存储
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    /**
     * 消息ID
     */
    private String id;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 消息角色
     */
    private MessageRole role;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 时间戳（毫秒）
     */
    private Long timestamp;
    
    /**
     * 重要性评分 (0.0-1.0)
     */
    private Double importance;
    
    /**
     * 已提取的事实ID列表
     */
    private List<String> extractedFacts;
    
    /**
     * 创建用户消息的工厂方法
     */
    public static ChatMessage user(String content) {
        return ChatMessage.builder()
            .role(MessageRole.USER)
            .content(content)
            .timestamp(System.currentTimeMillis())
            .build();
    }
    
    /**
     * 创建AI助手消息的工厂方法
     */
    public static ChatMessage assistant(String content) {
        return ChatMessage.builder()
            .role(MessageRole.ASSISTANT)
            .content(content)
            .timestamp(System.currentTimeMillis())
            .build();
    }
    
    /**
     * 创建系统消息的工厂方法
     */
    public static ChatMessage system(String content) {
        return ChatMessage.builder()
            .role(MessageRole.SYSTEM)
            .content(content)
            .timestamp(System.currentTimeMillis())
            .build();
    }
}




