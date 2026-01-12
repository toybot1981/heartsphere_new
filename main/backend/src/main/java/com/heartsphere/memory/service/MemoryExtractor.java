package com.heartsphere.memory.service;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserPreference;
import com.heartsphere.memory.model.character.CharacterInteractionMemory;
import com.heartsphere.memory.model.character.CharacterSceneMemory;

import java.util.List;

/**
 * 记忆提取器接口
 * 负责从对话中提取重要信息
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface MemoryExtractor {
    
    /**
     * 从对话中提取用户事实
     * 
     * @param userId 用户ID
     * @param messages 对话消息列表
     * @return 提取的用户事实列表
     */
    List<UserFact> extractFacts(String userId, List<ChatMessage> messages);
    
    /**
     * 从对话中提取用户偏好
     * 
     * @param userId 用户ID
     * @param messages 对话消息列表
     * @return 提取的用户偏好列表
     */
    List<UserPreference> extractPreferences(String userId, List<ChatMessage> messages);
    
    /**
     * 从对话中提取用户记忆
     * 
     * @param userId 用户ID
     * @param messages 对话消息列表
     * @return 提取的用户记忆列表
     */
    List<UserMemory> extractMemories(String userId, List<ChatMessage> messages);
    
    /**
     * 从对话中提取角色交互记忆
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param messages 对话消息列表
     * @return 提取的角色交互记忆列表
     */
    List<CharacterInteractionMemory> extractCharacterInteractionMemories(
        String characterId, String userId, List<ChatMessage> messages);
    
    /**
     * 从对话中提取角色场景记忆
     * 
     * @param characterId 角色ID
     * @param eraId 场景ID
     * @param messages 对话消息列表
     * @return 提取的角色场景记忆列表
     */
    List<CharacterSceneMemory> extractCharacterSceneMemories(
        String characterId, String eraId, List<ChatMessage> messages);
    
    /**
     * 验证和清理提取的事实
     * 
     * @param facts 原始事实列表
     * @return 验证后的事实列表
     */
    List<UserFact> validateAndCleanFacts(List<UserFact> facts);
    
    /**
     * 验证和清理提取的偏好
     * 
     * @param preferences 原始偏好列表
     * @return 验证后的偏好列表
     */
    List<UserPreference> validateAndCleanPreferences(List<UserPreference> preferences);
}

