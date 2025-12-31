package com.heartsphere.memory.service;

import com.heartsphere.memory.model.ChatMessage;

import java.time.Instant;
import java.util.List;

/**
 * 短期记忆服务接口
 * 负责管理对话上下文、会话状态和工作记忆
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface ShortMemoryService {
    
    // ========== 消息管理 ==========
    
    /**
     * 保存对话消息
     * 
     * @param sessionId 会话ID
     * @param message 消息对象
     */
    void saveMessage(String sessionId, ChatMessage message);
    
    /**
     * 获取对话消息列表（最近N条）
     * 
     * @param sessionId 会话ID
     * @param limit 消息数量限制
     * @return 消息列表
     */
    List<ChatMessage> getMessages(String sessionId, int limit);
    
    /**
     * 获取指定时间范围内的消息
     * 
     * @param sessionId 会话ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 消息列表
     */
    List<ChatMessage> getMessages(String sessionId, Instant startTime, Instant endTime);
    
    /**
     * 删除指定消息
     * 
     * @param sessionId 会话ID
     * @param messageId 消息ID
     */
    void deleteMessage(String sessionId, String messageId);
    
    /**
     * 清空会话的所有消息
     * 
     * @param sessionId 会话ID
     */
    void clearSession(String sessionId);
    
    // ========== 工作记忆 ==========
    
    /**
     * 保存工作记忆（临时状态）
     * 
     * @param sessionId 会话ID
     * @param key 键
     * @param value 值
     */
    void saveWorkingMemory(String sessionId, String key, Object value);
    
    /**
     * 获取工作记忆
     * 
     * @param sessionId 会话ID
     * @param key 键
     * @param type 类型
     * @param <T> 泛型
     * @return 工作记忆值
     */
    <T> T getWorkingMemory(String sessionId, String key, Class<T> type);
    
    /**
     * 删除工作记忆
     * 
     * @param sessionId 会话ID
     * @param key 键
     */
    void deleteWorkingMemory(String sessionId, String key);
    
    // ========== 会话管理 ==========
    
    /**
     * 检查会话是否存在
     * 
     * @param sessionId 会话ID
     * @return 是否存在
     */
    boolean sessionExists(String sessionId);
    
    /**
     * 删除会话（包括所有消息和工作记忆）
     * 
     * @param sessionId 会话ID
     */
    void deleteSession(String sessionId);
    
    /**
     * 获取用户的所有会话ID
     * 
     * @param userId 用户ID
     * @return 会话ID列表
     */
    List<String> getAllSessionIds(String userId);
    
    // ========== 统计 ==========
    
    /**
     * 获取会话的消息数量
     * 
     * @param sessionId 会话ID
     * @return 消息数量
     */
    int getMessageCount(String sessionId);
    
    /**
     * 获取用户的会话数量
     * 
     * @param userId 用户ID
     * @return 会话数量
     */
    int getSessionCount(String userId);
}



