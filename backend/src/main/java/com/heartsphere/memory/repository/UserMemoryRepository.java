package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserMemory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;

/**
 * 用户记忆Repository
 * 支持温度感系统的情感记忆检索
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface UserMemoryRepository extends MongoRepository<UserMemory, String> {
    
    /**
     * 根据用户ID查找所有记忆
     */
    List<UserMemory> findByUserId(String userId);
    
    /**
     * 根据用户ID和记忆类型查找记忆
     */
    List<UserMemory> findByUserIdAndType(String userId, MemoryType type);
    
    /**
     * 根据用户ID和重要性查找记忆
     */
    List<UserMemory> findByUserIdAndImportance(String userId, MemoryImportance importance);
    
    /**
     * 根据用户ID和记忆类型查找记忆（按创建时间降序）
     */
    List<UserMemory> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, MemoryType type, Pageable pageable);
    
    /**
     * 根据用户ID和重要性查找记忆（按最后访问时间降序）
     */
    List<UserMemory> findByUserIdAndImportanceOrderByLastAccessedAtDesc(String userId, MemoryImportance importance, Pageable pageable);
    
    /**
     * 根据用户ID查找记忆（按重要性降序，然后按访问次数降序）
     */
    @Query("{ 'userId': ?0 }")
    List<UserMemory> findByUserIdOrderByImportanceDescAccessCountDesc(String userId, Pageable pageable);
    
    /**
     * 文本搜索用户记忆
     */
    @Query("{ 'userId': ?0, '$text': { '$search': ?1 } }")
    List<UserMemory> searchByUserIdAndText(String userId, String query, Pageable pageable);
    
    /**
     * 根据用户ID和记忆类型查找记忆（分页）
     */
    Page<UserMemory> findByUserIdAndType(String userId, MemoryType type, Pageable pageable);
    
    /**
     * 根据用户ID和创建时间范围查找记忆
     */
    List<UserMemory> findByUserIdAndCreatedAtBetween(String userId, Instant startTime, Instant endTime);
    
    /**
     * 根据用户ID、记忆类型和元数据中的情绪类型查找记忆
     * 用于温度感系统的情感记忆检索
     */
    @Query("{ 'userId': ?0, 'type': ?1, 'metadata.emotionType': ?2 }")
    List<UserMemory> findByUserIdAndTypeAndEmotionType(String userId, MemoryType type, String emotionType, Pageable pageable);
    
    /**
     * 根据用户ID和元数据中的情绪类型查找记忆
     * 用于温度感系统的情感记忆检索
     */
    @Query("{ 'userId': ?0, 'metadata.emotionType': ?1 }")
    List<UserMemory> findByUserIdAndEmotionType(String userId, String emotionType, Pageable pageable);
    
    /**
     * 根据用户ID删除记忆
     */
    void deleteByUserId(String userId);
    
    /**
     * 根据用户ID和记忆类型删除记忆
     */
    void deleteByUserIdAndType(String userId, MemoryType type);
    
    /**
     * 统计用户的记忆数量
     */
    long countByUserId(String userId);
    
    /**
     * 统计用户指定类型的记忆数量
     */
    long countByUserIdAndType(String userId, MemoryType type);
    
    /**
     * 统计用户指定重要性的记忆数量
     */
    long countByUserIdAndImportance(String userId, MemoryImportance importance);
}

