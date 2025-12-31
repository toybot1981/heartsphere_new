package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.UserPreferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户偏好Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreferenceEntity, String> {
    
    /**
     * 根据用户ID获取所有偏好
     */
    List<UserPreferenceEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * 根据用户ID和键获取偏好
     */
    Optional<UserPreferenceEntity> findByUserIdAndKey(String userId, String key);
    
    /**
     * 根据用户ID统计偏好数量
     */
    long countByUserId(String userId);
    
    /**
     * 删除用户偏好
     */
    @Modifying
    @Query("DELETE FROM UserPreferenceEntity p WHERE p.userId = :userId AND p.key = :key")
    void deleteByUserIdAndKey(@Param("userId") String userId, @Param("key") String key);
}

