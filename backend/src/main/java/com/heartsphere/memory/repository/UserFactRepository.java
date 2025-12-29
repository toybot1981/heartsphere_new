package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.FactCategory;
import com.heartsphere.memory.model.UserFact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;

/**
 * 用户事实Repository
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface UserFactRepository extends MongoRepository<UserFact, String> {
    
    /**
     * 根据用户ID查找所有事实
     */
    List<UserFact> findByUserId(String userId);
    
    /**
     * 根据用户ID和类别查找事实
     */
    List<UserFact> findByUserIdAndCategory(String userId, FactCategory category);
    
    /**
     * 根据用户ID查找重要事实（按重要性降序）
     */
    List<UserFact> findByUserIdOrderByImportanceDesc(String userId);
    
    /**
     * 根据用户ID和最小重要性查找事实
     */
    List<UserFact> findByUserIdAndImportanceGreaterThanEqual(String userId, Double minImportance);
    
    /**
     * 根据用户ID和类别查找事实（分页）
     */
    Page<UserFact> findByUserIdAndCategory(String userId, FactCategory category, Pageable pageable);
    
    /**
     * 根据用户ID查找最近访问的事实
     */
    List<UserFact> findByUserIdOrderByLastAccessedAtDesc(String userId, Pageable pageable);
    
    /**
     * 文本搜索用户事实
     */
    @Query("{ 'userId': ?0, '$text': { '$search': ?1 } }")
    List<UserFact> searchByUserIdAndText(String userId, String query);
    
    /**
     * 根据用户ID和创建时间范围查找事实
     */
    List<UserFact> findByUserIdAndCreatedAtBetween(String userId, Instant startTime, Instant endTime);
    
    /**
     * 根据用户ID删除事实
     */
    void deleteByUserId(String userId);
    
    /**
     * 统计用户的事实数量
     */
    long countByUserId(String userId);
    
    /**
     * 统计用户指定类别的事实数量
     */
    long countByUserIdAndCategory(String userId, FactCategory category);
}

