package com.heartsphere.aistudio.context.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 优化后的上下文
 * 包含优化后的消息列表和元数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizedContext {

    /**
     * 优化后的消息列表
     */
    @Builder.Default
    private List<ContextMessage> messages = new ArrayList<>();

    /**
     * 使用的优化策略
     */
    private OptimizationStrategy strategy;

    /**
     * 原始消息数量
     */
    private Integer originalMessageCount;

    /**
     * 优化后消息数量
     */
    @Builder.Default
    private Integer optimizedMessageCount = 0;

    /**
     * 原始 token 数量
     */
    private Long originalTokenCount;

    /**
     * 优化后 token 数量
     */
    @Builder.Default
    private Long optimizedTokenCount = 0L;

    /**
     * 包含的摘要列表
     */
    @Builder.Default
    private List<ConversationSummary> summaries = new ArrayList<>();

    /**
     * 被丢弃的消息数量
     */
    @Builder.Default
    private Integer droppedMessageCount = 0;

    /**
     * 压缩率 (originalTokenCount / optimizedTokenCount)
     */
    public double getCompressionRatio() {
        if (optimizedTokenCount == null || optimizedTokenCount == 0) {
            return 0;
        }
        return (double) originalTokenCount / optimizedTokenCount;
    }

    /**
     * 获取所有消息的文本内容
     */
    public String getFullText() {
        return messages.stream()
            .map(ContextMessage::getText)
            .reduce((a, b) -> a + "\n" + b)
            .orElse("");
    }

    /**
     * 估算总 token 数量
     */
    public long estimateTotalTokens() {
        return messages.stream()
            .mapToLong(ContextMessage::estimateTokens)
            .sum();
    }

    /**
     * 添加消息
     */
    public void addMessage(ContextMessage message) {
        messages.add(message);
        optimizedMessageCount = messages.size();
        optimizedTokenCount = estimateTotalTokens();
    }
}
