package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.UserAIConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户AI配置Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface UserAIConfigRepository extends JpaRepository<UserAIConfig, Long> {
    
    /**
     * 根据用户ID查找配置
     */
    Optional<UserAIConfig> findByUserId(Long userId);
    
    /**
     * 根据用户ID删除配置
     */
    void deleteByUserId(Long userId);
}


