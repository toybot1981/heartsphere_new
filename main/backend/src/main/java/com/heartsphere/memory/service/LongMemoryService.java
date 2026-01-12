package com.heartsphere.memory.service;

import com.heartsphere.memory.model.FactCategory;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserPreference;

import java.util.List;
import java.util.Map;

/**
 * 长期记忆服务接口
 * 负责管理用户事实、偏好和记忆的持久化存储
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface LongMemoryService {
    
    // ========== 用户事实 ==========
    
    /**
     * 保存用户事实
     * 
     * @param fact 用户事实
     */
    void saveFact(UserFact fact);
    
    /**
     * 批量保存用户事实
     * 
     * @param facts 用户事实列表
     */
    void saveFacts(List<UserFact> facts);
    
    /**
     * 根据ID获取用户事实
     * 
     * @param factId 事实ID
     * @return 用户事实
     */
    UserFact getFact(String factId);
    
    /**
     * 获取用户的所有事实
     * 
     * @param userId 用户ID
     * @return 用户事实列表
     */
    List<UserFact> getAllFacts(String userId);
    
    /**
     * 根据类别获取用户事实
     * 
     * @param userId 用户ID
     * @param category 事实类别
     * @return 用户事实列表
     */
    List<UserFact> getFactsByCategory(String userId, FactCategory category);
    
    /**
     * 获取重要事实
     * 
     * @param userId 用户ID
     * @param minImportance 最小重要性
     * @return 用户事实列表
     */
    List<UserFact> getImportantFacts(String userId, double minImportance);
    
    /**
     * 搜索用户事实
     * 
     * @param userId 用户ID
     * @param query 查询关键词
     * @return 用户事实列表
     */
    List<UserFact> searchFacts(String userId, String query);
    
    /**
     * 删除用户事实
     * 
     * @param factId 事实ID
     */
    void deleteFact(String factId);
    
    // ========== 用户偏好 ==========
    
    /**
     * 保存用户偏好
     * 
     * @param preference 用户偏好
     */
    void savePreference(UserPreference preference);
    
    /**
     * 获取用户偏好
     * 
     * @param userId 用户ID
     * @param key 偏好键
     * @return 用户偏好
     */
    UserPreference getPreference(String userId, String key);
    
    /**
     * 获取用户的所有偏好
     * 
     * @param userId 用户ID
     * @return 用户偏好列表
     */
    List<UserPreference> getAllPreferences(String userId);
    
    /**
     * 删除用户偏好
     * 
     * @param userId 用户ID
     * @param key 偏好键
     */
    void deletePreference(String userId, String key);
    
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
}




