package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.UserPreference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * 用户偏好Repository
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public interface UserPreferenceRepository extends MongoRepository<UserPreference, String> {
    
    /**
     * 根据用户ID和键查找偏好（唯一）
     */
    Optional<UserPreference> findByUserIdAndKey(String userId, String key);
    
    /**
     * 根据用户ID查找所有偏好
     */
    List<UserPreference> findByUserId(String userId);
    
    /**
     * 根据用户ID查找所有偏好（按更新时间降序）
     */
    List<UserPreference> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    /**
     * 根据用户ID查找偏好（分页）
     */
    Page<UserPreference> findByUserId(String userId, Pageable pageable);
    
    /**
     * 根据用户ID和更新时间范围查找偏好
     */
    List<UserPreference> findByUserIdAndUpdatedAtBetween(String userId, Instant startTime, Instant endTime);
    
    /**
     * 根据用户ID删除偏好
     */
    void deleteByUserId(String userId);
    
    /**
     * 根据用户ID和键删除偏好
     */
    void deleteByUserIdAndKey(String userId, String key);
    
    /**
     * 统计用户的偏好数量
     */
    long countByUserId(String userId);
    
    /**
     * 检查偏好是否存在
     */
    boolean existsByUserIdAndKey(String userId, String key);
}

