package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.SystemAIConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 系统AI配置Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SystemAIConfigRepository extends JpaRepository<SystemAIConfig, Long> {
    
    /**
     * 根据配置键查找配置
     */
    Optional<SystemAIConfig> findByConfigKey(String configKey);
    
    /**
     * 查找启用状态的配置
     */
    Optional<SystemAIConfig> findByConfigKeyAndIsActiveTrue(String configKey);
}


