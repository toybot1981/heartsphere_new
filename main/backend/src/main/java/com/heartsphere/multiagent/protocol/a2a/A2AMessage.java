package com.heartsphere.multiagent.protocol.a2a;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Agent-to-Agent 消息格式
 * 
 * 定义智能体间通信的标准消息格式
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class A2AMessage {
    
    /**
     * 消息 ID
     */
    private String messageId;
    
    /**
     * 消息类型
     */
    private MessageType type;
    
    /**
     * 发送者 Agent ID
     */
    private String fromAgentId;
    
    /**
     * 接收者 Agent ID（null 表示广播）
     */
    private String toAgentId;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 消息负载（结构化数据）
     */
    private Map<String, Object> payload;
    
    /**
     * 关联的任务 ID（如果有）
     */
    private String taskId;
    
    /**
     * 消息时间戳
     */
    private LocalDateTime timestamp;
    
    /**
     * 消息类型枚举
     */
    public enum MessageType {
        REQUEST,    // 请求
        RESPONSE,   // 响应
        NOTIFICATION, // 通知
        ERROR       // 错误
    }
    
    /**
     * 创建请求消息
     */
    public static A2AMessage createRequest(String fromAgentId, String toAgentId, 
                                          String content, Map<String, Object> payload) {
        return A2AMessage.builder()
            .messageId(generateMessageId())
            .type(MessageType.REQUEST)
            .fromAgentId(fromAgentId)
            .toAgentId(toAgentId)
            .content(content)
            .payload(payload)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    /**
     * 创建响应消息
     */
    public static A2AMessage createResponse(String messageId, String fromAgentId, 
                                           String toAgentId, String content, 
                                           Map<String, Object> payload) {
        return A2AMessage.builder()
            .messageId(generateMessageId())
            .type(MessageType.RESPONSE)
            .fromAgentId(fromAgentId)
            .toAgentId(toAgentId)
            .content(content)
            .payload(payload)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    /**
     * 创建通知消息
     */
    public static A2AMessage createNotification(String fromAgentId, String toAgentId, 
                                               String content, Map<String, Object> payload) {
        return A2AMessage.builder()
            .messageId(generateMessageId())
            .type(MessageType.NOTIFICATION)
            .fromAgentId(fromAgentId)
            .toAgentId(toAgentId)
            .content(content)
            .payload(payload)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    /**
     * 创建错误消息
     */
    public static A2AMessage createError(String fromAgentId, String toAgentId, 
                                       String errorMessage) {
        return A2AMessage.builder()
            .messageId(generateMessageId())
            .type(MessageType.ERROR)
            .fromAgentId(fromAgentId)
            .toAgentId(toAgentId)
            .content(errorMessage)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    /**
     * 生成消息 ID
     */
    private static String generateMessageId() {
        return "a2a-" + System.currentTimeMillis() + "-" + 
               Long.toHexString(Double.doubleToLongBits(Math.random()));
    }
}
