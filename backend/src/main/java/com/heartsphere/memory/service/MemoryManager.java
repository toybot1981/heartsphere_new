package com.heartsphere.memory.service;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.ConversationContext;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserProfile;

import java.util.List;
import java.util.Map;

/**
 * 记忆管理器接口
 * 协调短期和长期记忆，提供统一的记忆访问接口
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface MemoryManager {
    
    // ========== 消息管理 ==========
    
    /**
     * 保存消息（同时保存到短期记忆）
     * 
     * @param userId 用户ID
     * @param sessionId 会话ID
     * @param message 消息对象
     */
    void saveMessage(String userId, String sessionId, ChatMessage message);
    
    /**
     * 获取对话上下文（短期记忆 + 相关长期记忆）
     * 
     * @param userId 用户ID
     * @param sessionId 会话ID
     * @param messageLimit 消息数量限制
     * @return 对话上下文
     */
    ConversationContext getConversationContext(String userId, String sessionId, int messageLimit);
    
    /**
     * 获取角色对话上下文（包含角色记忆）
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param sessionId 会话ID
     * @param eraId 场景ID（可选）
     * @param messageLimit 消息数量限制
     * @return 对话上下文
     */
    ConversationContext getCharacterConversationContext(
        String characterId, String userId, String sessionId, String eraId, int messageLimit);
    
    // ========== 记忆提取 ==========
    
    /**
     * 从会话中提取并保存记忆
     * 
     * @param userId 用户ID
     * @param sessionId 会话ID
     */
    void extractAndSaveMemories(String userId, String sessionId);
    
    /**
     * 从会话中提取并保存角色记忆
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param sessionId 会话ID
     * @param eraId 场景ID（可选）
     */
    void extractAndSaveCharacterMemories(
        String characterId, String userId, String sessionId, String eraId);
    
    /**
     * 从消息中提取事实
     * 
     * @param userId 用户ID
     * @param messages 消息列表
     * @return 提取的事实列表
     */
    List<UserFact> extractFacts(String userId, List<ChatMessage> messages);
    
    // ========== 记忆检索 ==========
    
    /**
     * 检索相关记忆
     * 
     * @param userId 用户ID
     * @param query 查询关键词
     * @param limit 返回数量限制
     * @return 用户记忆列表
     */
    List<UserMemory> retrieveRelevantMemories(String userId, String query, int limit);
    
    /**
     * 根据上下文检索记忆
     * 
     * @param userId 用户ID
     * @param context 上下文信息
     * @param limit 返回数量限制
     * @return 用户记忆列表
     */
    List<UserMemory> retrieveMemoriesByContext(String userId, Map<String, Object> context, int limit);
    
    // ========== 用户画像 ==========
    
    /**
     * 获取用户画像
     * 
     * @param userId 用户ID
     * @return 用户画像
     */
    UserProfile getUserProfile(String userId);
    
    /**
     * 对话上下文
     * 使用独立的ConversationContext类，见model包
     */
}

