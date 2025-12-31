package com.heartsphere.memory.model.character;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 角色记忆画像
 * 汇总角色的所有记忆信息
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharacterMemoryProfile {
    
    /**
     * 角色ID
     */
    private String characterId;
    
    /**
     * 自身记忆列表
     */
    private List<CharacterSelfMemory> selfMemories;
    
    /**
     * 交互记忆列表
     */
    private List<CharacterInteractionMemory> interactionMemories;
    
    /**
     * 场景记忆列表
     */
    private List<CharacterSceneMemory> sceneMemories;
    
    /**
     * 关系记忆列表
     */
    private List<CharacterRelationshipMemory> relationshipMemories;
    
    /**
     * 统计信息
     */
    private Statistics statistics;
    
    /**
     * 扩展元数据
     */
    private Map<String, Object> metadata;
    
    /**
     * 统计信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Statistics {
        /**
         * 自身记忆数量
         */
        private Integer totalSelfMemories;
        
        /**
         * 交互记忆数量
         */
        private Integer totalInteractionMemories;
        
        /**
         * 场景记忆数量
         */
        private Integer totalSceneMemories;
        
        /**
         * 关系数量
         */
        private Integer totalRelationships;
        
        /**
         * 交互过的用户数量
         */
        private Integer totalInteractedUsers;
        
        /**
         * 活跃的场景数量
         */
        private Integer totalActiveScenes;
    }
}



