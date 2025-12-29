package com.heartsphere.heartconnect.repository;

import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 心域共享配置Repository
 */
@Repository
public interface HeartSphereShareConfigRepository extends JpaRepository<HeartSphereShareConfig, Long> {
    
    /**
     * 根据用户ID查找共享配置
     */
    Optional<HeartSphereShareConfig> findByUserId(Long userId);
    
    /**
     * 根据共享码查找共享配置
     */
    Optional<HeartSphereShareConfig> findByShareCode(String shareCode);
    
    /**
     * 根据共享状态查找共享配置列表
     */
    List<HeartSphereShareConfig> findByShareStatus(HeartSphereShareConfig.ShareStatus shareStatus);
    
    /**
     * 检查用户是否已有共享配置
     */
    boolean existsByUserId(Long userId);
}

