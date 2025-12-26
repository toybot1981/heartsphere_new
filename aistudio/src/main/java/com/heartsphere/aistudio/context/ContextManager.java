package com.heartsphere.aistudio.context;

import com.heartsphere.aistudio.context.memory.ChatMemory;
import com.heartsphere.aistudio.context.model.*;
import com.heartsphere.aistudio.context.optimizer.ContextOptimizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 上下文管理器
 * 负责管理 AI Agent 的对话上下文
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContextManager {

    private final ChatMemory chatMemory;
    private final ContextOptimizer contextOptimizer;

    // 会话缓存
    private final Map<String, ContextSession> sessionCache = new ConcurrentHashMap<>();

    // 默认配置
    private static final int DEFAULT_MAX_TOKENS = 8000;
    private static final OptimizationStrategy DEFAULT_STRATEGY = OptimizationStrategy.HYBRID;

    /**
     * 初始化会话
     *
     * @param sessionId 会话ID
     * @param userId    用户ID
     * @param agentId   Agent ID
     * @return 会话对象
     */
    public ContextSession initializeSession(String sessionId, String userId, String agentId) {
        ContextSession session = ContextSession.builder()
            .sessionId(sessionId)
            .userId(userId)
            .agentId(agentId)
            .status(ContextSession.SessionStatus.ACTIVE)
            .createdAt(Instant.now())
            .lastActiveAt(Instant.now())
            .maxTokens(DEFAULT_MAX_TOKENS)
            .build();

        sessionCache.put(sessionId, session);
        log.info("Initialized session: {} for user: {} and agent: {}", sessionId, userId, agentId);

        return session;
    }

    /**
     * 获取会话
     *
     * @param sessionId 会话ID
     * @return 会话对象，如果不存在则返回 null
     */
    public ContextSession getSession(String sessionId) {
        return sessionCache.get(sessionId);
    }

    /**
     * 添加消息到上下文
     *
     * @param sessionId 会话ID
     * @param message   消息
     */
    public void addMessage(String sessionId, ContextMessage message) {
        // 添加到 Redis 存储
        chatMemory.add(sessionId, message);

        // 更新会话信息
        ContextSession session = sessionCache.get(sessionId);
        if (session != null) {
            session.updateLastActive();
            session.incrementMessageCount(1);
            session.addTokens(message.estimateTokens());
        }

        log.debug("Added message to session: {}", sessionId);
    }

    /**
     * 批量添加消息
     *
     * @param sessionId 会话ID
     * @param messages  消息列表
     */
    public void addMessages(String sessionId, List<ContextMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return;
        }

        chatMemory.add(sessionId, messages);

        ContextSession session = sessionCache.get(sessionId);
        if (session != null) {
            session.updateLastActive();
            session.incrementMessageCount(messages.size());

            long totalTokens = messages.stream()
                .mapToLong(ContextMessage::estimateTokens)
                .sum();
            session.addTokens(totalTokens);
        }

        log.debug("Added {} messages to session: {}", messages.size(), sessionId);
    }

    /**
     * 获取优化后的上下文（用于 LLM 调用）
     *
     * @param sessionId 会话ID
     * @param maxTokens 最大 token 数量
     * @return 优化后的消息列表
     */
    public List<ContextMessage> getOptimizedContext(String sessionId, int maxTokens) {
        List<ContextMessage> allMessages = chatMemory.getAll(sessionId);

        if (allMessages.isEmpty()) {
            return List.of();
        }

        // 获取会话配置的优化策略
        ContextSession session = sessionCache.get(sessionId);
        OptimizationStrategy strategy = session != null ?
            getStrategyForSession(session) : DEFAULT_STRATEGY;

        // 优化上下文
        OptimizedContext optimized = contextOptimizer.optimize(
            allMessages,
            maxTokens,
            strategy
        );

        log.debug("Optimized context for session: {} - original: {} messages, {} tokens -> " +
                "optimized: {} messages, {} tokens (strategy: {})",
            sessionId,
            optimized.getOriginalMessageCount(),
            optimized.getOriginalTokenCount(),
            optimized.getOptimizedMessageCount(),
            optimized.getOptimizedTokenCount(),
            strategy);

        return optimized.getMessages();
    }

    /**
     * 获取最近的 N 条消息
     *
     * @param sessionId 会话ID
     * @param lastN     消息数量
     * @return 消息列表
     */
    public List<ContextMessage> getRecentMessages(String sessionId, int lastN) {
        return chatMemory.get(sessionId, lastN);
    }

    /**
     * 获取指定时间范围的消息
     *
     * @param sessionId 会话ID
     * @param since     起始时间
     * @param until     结束时间
     * @return 消息列表
     */
    public List<ContextMessage> getMessagesInTimeRange(String sessionId, Instant since, Instant until) {
        return chatMemory.get(sessionId, since, until);
    }

    /**
     * 获取会话的所有消息
     *
     * @param sessionId 会话ID
     * @return 消息列表
     */
    public List<ContextMessage> getAllMessages(String sessionId) {
        return chatMemory.getAll(sessionId);
    }

    /**
     * 获取消息总数
     *
     * @param sessionId 会话ID
     * @return 消息数量
     */
    public int getMessageCount(String sessionId) {
        return chatMemory.size(sessionId);
    }

    /**
     * 清除会话上下文
     *
     * @param sessionId 会话ID
     */
    public void clearContext(String sessionId) {
        chatMemory.clear(sessionId);

        ContextSession session = sessionCache.get(sessionId);
        if (session != null) {
            session.setMessageCount(0);
            session.setTotalTokens(0L);
        }

        log.info("Cleared context for session: {}", sessionId);
    }

    /**
     * 归档会话
     *
     * @param sessionId 会话ID
     */
    public void archiveSession(String sessionId) {
        ContextSession session = sessionCache.get(sessionId);
        if (session != null) {
            session.archive();
            log.info("Archived session: {}", sessionId);
        }
    }

    /**
     * 删除会话
     *
     * @param sessionId 会话ID
     */
    public void deleteSession(String sessionId) {
        chatMemory.delete(sessionId);
        sessionCache.remove(sessionId);
        log.info("Deleted session: {}", sessionId);
    }

    /**
     * 获取所有会话ID
     *
     * @return 会话ID列表
     */
    public List<String> getAllSessionIds() {
        return new ArrayList<>(sessionCache.keySet());
    }

    /**
     * 检查会话是否存在
     *
     * @param sessionId 会话ID
     * @return 是否存在
     */
    public boolean sessionExists(String sessionId) {
        return sessionCache.containsKey(sessionId);
    }

    /**
     * 获取会话统计信息
     *
     * @param sessionId 会话ID
     * @return 统计信息
     */
    public Map<String, Object> getSessionStats(String sessionId) {
        ContextSession session = sessionCache.get(sessionId);
        if (session == null) {
            return Map.of();
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("sessionId", session.getSessionId());
        stats.put("userId", session.getUserId());
        stats.put("agentId", session.getAgentId());
        stats.put("messageCount", session.getMessageCount());
        stats.put("totalTokens", session.getTotalTokens());
        stats.put("maxTokens", session.getMaxTokens());
        stats.put("tokenUsageRate", session.getTokenUsageRate());
        stats.put("status", session.getStatus());
        stats.put("createdAt", session.getCreatedAt());
        stats.put("lastActiveAt", session.getLastActiveAt());

        return stats;
    }

    /**
     * 根据会话类型选择优化策略
     */
    private OptimizationStrategy getStrategyForSession(ContextSession session) {
        // 根据会话类型选择策略
        return switch (session.getType()) {
            case CHAT -> OptimizationStrategy.HYBRID; // 普通对话用混合策略
            case TASK -> OptimizationStrategy.IMPORTANCE_BASED; // 任务用重要性策略
            case WORKFLOW -> OptimizationStrategy.SUMMARIZATION; // 工作流用摘要策略
            case COLLABORATIVE -> OptimizationStrategy.ROLLING_WINDOW; // 协作用滚动窗口
        };
    }

    /**
     * 转换为 Spring AI Message 列表
     *
     * @param contextMessages 上下文消息列表
     * @return Spring AI Message 列表
     */
    public List<Message> toSpringAIMessages(List<ContextMessage> contextMessages) {
        return contextMessages.stream()
            .map(this::convertToSpringAIMessage)
            .toList();
    }

    /**
     * 转换单条消息为 Spring AI Message
     */
    private Message convertToSpringAIMessage(ContextMessage contextMessage) {
        return switch (contextMessage.getMessageType()) {
            case USER -> new org.springframework.ai.chat.messages.UserMessage(contextMessage.getText());
            case ASSISTANT -> new org.springframework.ai.chat.messages.AssistantMessage(contextMessage.getText());
            case SYSTEM -> new org.springframework.ai.chat.messages.SystemMessage(contextMessage.getText());
        };
    }
}
