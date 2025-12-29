package com.heartsphere.heartconnect.repository;

import com.heartsphere.heartconnect.entity.HeartSphereShareScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 共享范围Repository
 */
@Repository
public interface HeartSphereShareScopeRepository extends JpaRepository<HeartSphereShareScope, Long> {
    
    /**
     * 根据共享配置ID查找所有范围
     */
    List<HeartSphereShareScope> findByShareConfigId(Long shareConfigId);
    
    /**
     * 根据共享配置ID和范围类型查找
     */
    List<HeartSphereShareScope> findByShareConfigIdAndScopeType(
            Long shareConfigId, 
            HeartSphereShareScope.ScopeType scopeType
    );
    
    /**
     * 删除共享配置的所有范围
     */
    void deleteByShareConfigId(Long shareConfigId);
    
    /**
     * 检查范围是否存在
     */
    boolean existsByShareConfigIdAndScopeTypeAndScopeId(
            Long shareConfigId,
            HeartSphereShareScope.ScopeType scopeType,
            Long scopeId
    );
}

