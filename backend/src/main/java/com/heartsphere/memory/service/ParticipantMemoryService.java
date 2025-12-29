package com.heartsphere.memory.service;

import com.heartsphere.memory.model.participant.*;

import java.util.List;

/**
 * 参与者记忆服务接口
 * 负责管理参与者的记忆，包括身份记忆、交互记忆、关系网络、偏好记忆和场景记忆
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
public interface ParticipantMemoryService {
    
    // ========== 参与者身份记忆 ==========
    
    /**
     * 保存参与者身份记忆
     */
    ParticipantIdentityMemory saveIdentityMemory(ParticipantIdentityMemory memory);
    
    /**
     * 获取参与者身份记忆
     */
    ParticipantIdentityMemory getIdentityMemory(String participantId);
    
    /**
     * 根据场景ID获取参与者身份记忆
     */
    ParticipantIdentityMemory getIdentityMemory(String participantId, String sceneId);
    
    /**
     * 更新参与者身份记忆
     */
    ParticipantIdentityMemory updateIdentityMemory(String participantId, ParticipantIdentityMemory memory);
    
    // ========== 参与者交互记忆 ==========
    
    /**
     * 保存参与者交互记忆
     */
    ParticipantInteractionMemory saveInteractionMemory(ParticipantInteractionMemory memory);
    
    /**
     * 获取参与者的所有交互记忆
     */
    List<ParticipantInteractionMemory> getInteractionMemories(String participantId);
    
    /**
     * 获取参与者与特定参与者的交互记忆
     */
    List<ParticipantInteractionMemory> getInteractionMemories(
        String participantId, String relatedParticipantId);
    
    /**
     * 根据场景ID获取交互记忆
     */
    List<ParticipantInteractionMemory> getInteractionMemoriesByScene(
        String participantId, String sceneId);
    
    /**
     * 根据交互类型获取交互记忆
     */
    List<ParticipantInteractionMemory> getInteractionMemoriesByType(
        String participantId, ParticipantInteractionMemory.InteractionType interactionType);
    
    // ========== 参与者关系 ==========
    
    /**
     * 保存或更新参与者关系
     */
    ParticipantRelationship saveRelationship(ParticipantRelationship relationship);
    
    /**
     * 获取参与者关系
     */
    ParticipantRelationship getRelationship(String participantId, String relatedParticipantId);
    
    /**
     * 获取参与者的所有关系
     */
    List<ParticipantRelationship> getAllRelationships(String participantId);
    
    /**
     * 根据关系类型获取关系
     */
    List<ParticipantRelationship> getRelationshipsByType(
        String participantId, ParticipantRelationship.RelationshipType relationshipType);
    
    /**
     * 更新关系强度
     */
    ParticipantRelationship updateRelationshipStrength(
        String participantId, String relatedParticipantId, double strength);
    
    /**
     * 增加交互次数
     */
    void incrementInteractionCount(String participantId, String relatedParticipantId);
    
    // ========== 参与者偏好 ==========
    
    /**
     * 保存或更新参与者偏好
     */
    ParticipantPreference savePreference(ParticipantPreference preference);
    
    /**
     * 获取参与者偏好
     */
    ParticipantPreference getPreference(String participantId, String key);
    
    /**
     * 根据场景ID获取参与者偏好
     */
    ParticipantPreference getPreference(String participantId, String sceneId, String key);
    
    /**
     * 获取参与者的所有偏好
     */
    List<ParticipantPreference> getAllPreferences(String participantId);
    
    /**
     * 根据场景ID获取所有偏好
     */
    List<ParticipantPreference> getPreferencesByScene(String participantId, String sceneId);
    
    // ========== 参与者场景记忆 ==========
    
    /**
     * 保存参与者场景记忆
     */
    ParticipantSceneMemory saveSceneMemory(ParticipantSceneMemory memory);
    
    /**
     * 获取参与者在特定场景中的记忆
     */
    List<ParticipantSceneMemory> getSceneMemories(String participantId, String sceneId);
    
    /**
     * 获取场景的所有参与者记忆
     */
    List<ParticipantSceneMemory> getSceneMemoriesByScene(String sceneId);
    
    /**
     * 获取参与者的所有场景记忆
     */
    List<ParticipantSceneMemory> getAllSceneMemories(String participantId);
    
    // ========== 记忆检索 ==========
    
    /**
     * 检索相关记忆
     */
    List<ParticipantMemory> retrieveRelevantMemories(String participantId, String query, int limit);
    
    /**
     * 通用参与者记忆接口（用于检索结果）
     */
    interface ParticipantMemory {
        String getId();
        String getParticipantId();
        String getContent();
        String getType();
    }
}

