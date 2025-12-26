package com.heartsphere.aistudio.context.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;

import java.time.Instant;
import java.util.Map;

/**
 * 上下文消息模型
 * 扩展 Spring AI 的 Message 接口，添加元数据和时间戳
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContextMessage implements Message {

    /**
     * 消息类型
     */
    private MessageType messageType;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 消息ID
     */
    private String messageId;

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 时间戳
     */
    @Builder.Default
    private Instant timestamp = Instant.now();

    /**
     * Token 数量（估算）
     */
    private Integer tokenCount;

    /**
     * 重要性评分 (0.0 - 1.0)
     * 用于上下文优化时决定保留哪些消息
     */
    @Builder.Default
    private Double importance = 0.5;

    /**
     * 元数据
     */
    @Builder.Default
    private Map<String, Object> metadata = Map.of();

    @Override
    public String getText() {
        return content;
    }

    @Override
    public MessageType getMessageType() {
        return messageType;
    }

    /**
     * 获取字符数（用于 token 估算）
     */
    public int getCharCount() {
        return content != null ? content.length() : 0;
    }

    /**
     * 估算 token 数量（中文约 1.5 字符/token，英文约 4 字符/token）
     * 这里使用简化估算：1 token ≈ 3 字符
     */
    public int estimateTokens() {
        if (tokenCount != null) {
            return tokenCount;
        }
        return getCharCount() / 3 + 1;
    }

    /**
     * 创建用户消息
     */
    public static ContextMessage user(String content, String sessionId, String userId) {
        return ContextMessage.builder()
            .messageType(MessageType.USER)
            .content(content)
            .sessionId(sessionId)
            .userId(userId)
            .timestamp(Instant.now())
            .build();
    }

    /**
     * 创建助手消息
     */
    public static ContextMessage assistant(String content, String sessionId) {
        return ContextMessage.builder()
            .messageType(MessageType.ASSISTANT)
            .content(content)
            .sessionId(sessionId)
            .timestamp(Instant.now())
            .build();
    }

    /**
     * 创建系统消息
     */
    public static ContextMessage system(String content, String sessionId) {
        return ContextMessage.builder()
            .messageType(MessageType.SYSTEM)
            .content(content)
            .sessionId(sessionId)
            .timestamp(Instant.now())
            .importance(1.0) // 系统消息始终重要
            .build();
    }

    /**
     * 从 Spring AI Message 转换
     */
    public static ContextMessage from(Message message, String sessionId, String userId) {
        return ContextMessage.builder()
            .messageType(message.getMessageType())
            .content(message.getText())
            .sessionId(sessionId)
            .userId(userId)
            .timestamp(Instant.now())
            .build();
    }

    /**
     * 转换为 Spring AI Message
     */
    public Message toSpringAIMessage() {
        return new org.springframework.ai.chat.messages.AssistantMessage(content);
    }
}
