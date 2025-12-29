package com.heartsphere.memory.service;

import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.character.*;

import java.util.List;
import java.util.Map;

/**
 * 角色记忆服务接口
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
public interface CharacterMemoryService {
    
    // ========== 角色自身记忆 ==========
    
    /**
     * 保存角色自身记忆
     */
    CharacterSelfMemory saveCharacterSelfMemory(CharacterSelfMemory memory);
    
    /**
     * 获取角色自身记忆
     */
    CharacterSelfMemory getCharacterSelfMemory(String memoryId);
    
    /**
     * 获取角色的所有自身记忆
     */
    List<CharacterSelfMemory> getCharacterSelfMemories(String characterId);
    
    /**
     * 根据类型获取角色自身记忆
     */
    List<CharacterSelfMemory> getCharacterSelfMemoriesByType(String characterId, MemoryType type);
    
    /**
     * 更新角色自身记忆
     */
    CharacterSelfMemory updateCharacterSelfMemory(String memoryId, CharacterSelfMemory memory);
    
    /**
     * 删除角色自身记忆
     */
    void deleteCharacterSelfMemory(String memoryId);
    
    // ========== 角色与用户交互记忆 ==========
    
    /**
     * 保存角色交互记忆
     */
    CharacterInteractionMemory saveInteractionMemory(CharacterInteractionMemory memory);
    
    /**
     * 获取角色交互记忆
     */
    CharacterInteractionMemory getInteractionMemory(String memoryId);
    
    /**
     * 获取角色与用户的交互记忆
     */
    List<CharacterInteractionMemory> getInteractionMemories(String characterId, String userId);
    
    /**
     * 获取角色与用户在特定场景中的交互记忆
     */
    List<CharacterInteractionMemory> getInteractionMemories(
        String characterId, String userId, String eraId);
    
    /**
     * 更新角色交互记忆
     */
    CharacterInteractionMemory updateInteractionMemory(String memoryId, CharacterInteractionMemory memory);
    
    /**
     * 删除角色交互记忆
     */
    void deleteInteractionMemory(String memoryId);
    
    // ========== 角色场景记忆 ==========
    
    /**
     * 保存角色场景记忆
     */
    CharacterSceneMemory saveSceneMemory(CharacterSceneMemory memory);
    
    /**
     * 获取角色场景记忆
     */
    CharacterSceneMemory getSceneMemory(String memoryId);
    
    /**
     * 获取角色在特定场景中的记忆
     */
    List<CharacterSceneMemory> getSceneMemories(String characterId, String eraId);
    
    /**
     * 获取角色的所有场景记忆
     */
    List<CharacterSceneMemory> getSceneMemories(String characterId);
    
    /**
     * 获取可继承的场景记忆
     */
    List<CharacterSceneMemory> getInheritableSceneMemories(String characterId);
    
    /**
     * 更新角色场景记忆
     */
    CharacterSceneMemory updateSceneMemory(String memoryId, CharacterSceneMemory memory);
    
    /**
     * 删除角色场景记忆
     */
    void deleteSceneMemory(String memoryId);
    
    // ========== 角色关系记忆 ==========
    
    /**
     * 保存或更新角色关系记忆
     */
    CharacterRelationshipMemory saveRelationshipMemory(CharacterRelationshipMemory memory);
    
    /**
     * 获取角色关系记忆
     */
    CharacterRelationshipMemory getRelationshipMemory(String memoryId);
    
    /**
     * 获取两个角色之间的关系
     */
    CharacterRelationshipMemory getRelationshipMemory(
        String characterId, String relatedCharacterId);
    
    /**
     * 获取角色的所有关系
     */
    List<CharacterRelationshipMemory> getAllRelationships(String characterId);
    
    /**
     * 根据关系类型获取关系
     */
    List<CharacterRelationshipMemory> getRelationshipsByType(
        String characterId, CharacterRelationshipMemory.RelationshipType relationshipType);
    
    /**
     * 更新关系强度
     */
    CharacterRelationshipMemory updateRelationshipStrength(
        String characterId, String relatedCharacterId, double strength);
    
    /**
     * 添加交互记录到关系
     */
    CharacterRelationshipMemory addInteractionToRelationship(
        String characterId, String relatedCharacterId,
        CharacterRelationshipMemory.InteractionRecord interaction);
    
    /**
     * 删除角色关系记忆
     */
    void deleteRelationshipMemory(String memoryId);
    
    // ========== 记忆检索 ==========
    
    /**
     * 检索相关记忆
     */
    List<CharacterMemory> retrieveRelevantMemories(
        String characterId, String query, int limit);
    
    /**
     * 根据上下文检索记忆
     */
    List<CharacterMemory> retrieveMemoriesByContext(
        String characterId, Map<String, Object> context, int limit);
    
    // ========== 角色记忆画像 ==========
    
    /**
     * 获取角色记忆画像
     */
    CharacterMemoryProfile getCharacterMemoryProfile(String characterId);
    
    /**
     * 通用角色记忆接口（用于检索结果）
     */
    interface CharacterMemory {
        String getId();
        String getCharacterId();
        MemoryType getType();
        String getContent();
        Double getRelevance(String query);
        java.time.Instant getTimestamp();
    }
}

