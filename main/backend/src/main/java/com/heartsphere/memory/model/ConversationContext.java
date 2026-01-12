package com.heartsphere.memory.model;

import com.heartsphere.memory.model.character.CharacterInteractionMemory;
import com.heartsphere.memory.model.character.CharacterSceneMemory;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 对话上下文
 * 包含短期记忆和相关的长期记忆
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Builder
public class ConversationContext {
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 角色ID（可选，用于角色对话）
     */
    private String characterId;
    
    /**
     * 场景ID（可选，用于场景对话）
     */
    private String eraId;
    
    /**
     * 对话消息列表（短期记忆）
     */
    private List<ChatMessage> messages;
    
    /**
     * 相关记忆列表（长期记忆）
     */
    private List<UserMemory> relevantMemories;
    
    /**
     * 用户偏好列表
     */
    private List<UserPreference> userPreferences;
    
    /**
     * 角色交互记忆列表（角色与用户的交互记忆）
     */
    private List<CharacterInteractionMemory> characterInteractionMemories;
    
    /**
     * 角色场景记忆列表（角色在场景中的记忆）
     */
    private List<CharacterSceneMemory> characterSceneMemories;
    
    /**
     * 扩展上下文信息
     */
    private Map<String, Object> metadata;
}

