package com.heartsphere.aistudio.context.memory;

import com.heartsphere.aistudio.context.model.ContextMessage;
import org.springframework.ai.chat.messages.Message;

import java.time.Instant;
import java.util.List;

/**
 * 聊天记忆接口
 * 负责管理对话历史的短期存储
 */
public interface ChatMemory {

    /**
     * 添加消息到会话记忆
     *
     * @param sessionId 会话ID
     * @param messages  消息列表
     */
    void add(String sessionId, List<ContextMessage> messages);

    /**
     * 添加单条消息
     *
     * @param sessionId 会话ID
     * @param message   消息
     */
    default void add(String sessionId, ContextMessage message) {
        add(sessionId, List.of(message));
    }

    /**
     * 获取最近的 N 条消息
     *
     * @param sessionId 会话ID
     * @param lastN     获取最近的消息数量
     * @return 消息列表
     */
    List<ContextMessage> get(String sessionId, int lastN);

    /**
     * 获取所有消息
     *
     * @param sessionId 会话ID
     * @return 消息列表
     */
    default List<ContextMessage> getAll(String sessionId) {
        return get(sessionId, Integer.MAX_VALUE);
    }

    /**
     * 获取指定时间范围内的消息
     *
     * @param sessionId 会话ID
     * @param since     起始时间
     * @param until     结束时间
     * @return 消息列表
     */
    List<ContextMessage> get(String sessionId, Instant since, Instant until);

    /**
     * 获取消息总数
     *
     * @param sessionId 会话ID
     * @return 消息数量
     */
    int size(String sessionId);

    /**
     * 清除会话记忆
     *
     * @param sessionId 会话ID
     */
    void clear(String sessionId);

    /**
     * 检查会话是否存在
     *
     * @param sessionId 会话ID
     * @return 是否存在
     */
    boolean exists(String sessionId);

    /**
     * 删除会话
     *
     * @param sessionId 会话ID
     */
    void delete(String sessionId);

    /**
     * 获取所有会话ID
     *
     * @return 会话ID列表
     */
    List<String> getAllSessionIds();
}
