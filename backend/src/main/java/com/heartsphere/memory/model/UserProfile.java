package com.heartsphere.memory.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 用户画像
 * 基于长期记忆构建的用户画像
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Data
@Builder
public class UserProfile {
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 用户事实列表
     */
    private List<UserFact> facts;
    
    /**
     * 用户偏好列表
     */
    private List<UserPreference> preferences;
    
    /**
     * 用户记忆列表
     */
    private List<UserMemory> memories;
    
    /**
     * 统计信息
     */
    private ProfileStatistics statistics;
    
    @Data
    @Builder
    public static class ProfileStatistics {
        /**
         * 事实总数
         */
        private Integer totalFacts;
        
        /**
         * 偏好总数
         */
        private Integer totalPreferences;
        
        /**
         * 记忆总数
         */
        private Integer totalMemories;
        
        /**
         * 核心记忆数量
         */
        private Integer coreMemories;
        
        /**
         * 重要记忆数量
         */
        private Integer importantMemories;
    }
}



