package com.heartsphere.heartconnect.portal.repository;

import com.heartsphere.heartconnect.portal.entity.PortalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 传送门配置Repository
 * 参考HeartSphereShareConfigRepository的设计模式
 */
@Repository
public interface PortalConfigRepository extends JpaRepository<PortalConfig, Long> {
    
    /**
     * 根据用户ID查询传送门列表
     */
    List<PortalConfig> findByUserId(Long userId);
    
    /**
     * 根据场景ID查询传送门列表
     */
    List<PortalConfig> findBySceneId(Long sceneId);
    
    /**
     * 根据用户ID和场景ID查询传送门列表
     */
    List<PortalConfig> findByUserIdAndSceneId(Long userId, Long sceneId);
    
    /**
     * 根据场景ID和激活状态查询传送门列表
     */
    List<PortalConfig> findBySceneIdAndIsActive(Long sceneId, Boolean isActive);
    
    /**
     * 根据目标共享码查询传送门列表
     */
    List<PortalConfig> findByTargetShareCode(String targetShareCode);
    
    /**
     * 检查用户是否在指定场景中已有传送门
     */
    boolean existsByUserIdAndSceneId(Long userId, Long sceneId);
    
    /**
     * 查询场景中激活的传送门数量
     */
    @Query("SELECT COUNT(p) FROM PortalConfig p WHERE p.sceneId = :sceneId AND p.isActive = true")
    long countActivePortalsBySceneId(@Param("sceneId") Long sceneId);
}
