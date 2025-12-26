package com.heartsphere.aistudio.context.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * 上下文会话模型
 * 表示一个完整的对话会话
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContextSession {

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * Agent ID
     */
    private String agentId;

    /**
     * 会话标题
     */
    private String title;

    /**
     * 会话状态
     */
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE;

    /**
     * 创建时间
     */
    @Builder.Default
    private Instant createdAt = Instant.now();

    /**
     * 最后活跃时间
     */
    @Builder.Default
    private Instant lastActiveAt = Instant.now();

    /**
     * 消息总数
     */
    @Builder.Default
    private Integer messageCount = 0;

    /**
     * 总 token 数量（估算）
     */
    @Builder.Default
    private Long totalTokens = 0L;

    /**
     * 最大 token 限制
     */
    @Builder.Default
    private Integer maxTokens = 8000;

    /**
     * 会话元数据
     */
    @Builder.Default
    private Map<String, Object> metadata = Map.of();

    /**
     * 系统提示词
     */
    private String systemPrompt;

    /**
     * 会话类型
     */
    @Builder.Default
    private SessionType type = SessionType.CHAT;

    /**
     * 更新最后活跃时间
     */
    public void updateLastActive() {
        this.lastActiveAt = Instant.now();
    }

    /**
     * 增加消息计数
     */
    public void incrementMessageCount(int count) {
        this.messageCount += count;
    }

    /**
     * 增加 token 计数
     */
    public void addTokens(long tokens) {
        this.totalTokens += tokens;
    }

    /**
     * 检查是否超过 token 限制
     */
    public boolean isOverTokenLimit() {
        return totalTokens >= maxTokens;
    }

    /**
     * 获取 token 使用率
     */
    public double getTokenUsageRate() {
        return maxTokens > 0 ? (double) totalTokens / maxTokens : 0;
    }

    /**
     * 归档会话
     */
    public void archive() {
        this.status = SessionStatus.ARCHIVED;
    }

    /**
     * 会话状态枚举
     */
    public enum SessionStatus {
        ACTIVE,      // 活跃中
        ARCHIVED,    // 已归档
        DELETED,     // 已删除
        EXPIRED      // 已过期
    }

    /**
     * 会话类型枚举
     */
    public enum SessionType {
        CHAT,        // 普通对话
        TASK,        // 任务执行
        WORKFLOW,    // 工作流
        COLLABORATIVE // 多人协作
    }
}
