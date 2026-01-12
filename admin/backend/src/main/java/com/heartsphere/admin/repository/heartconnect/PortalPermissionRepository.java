package com.heartsphere.admin.repository.heartconnect;

import com.heartsphere.admin.entity.heartconnect.PortalPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 传送门权限Repository
 */
@Repository
public interface PortalPermissionRepository extends JpaRepository<PortalPermission, Long> {
    
    /**
     * 根据传送门ID查询权限列表
     */
    List<PortalPermission> findByPortalId(Long portalId);
    
    /**
     * 根据用户ID查询权限列表
     */
    List<PortalPermission> findByUserId(Long userId);
    
    /**
     * 根据传送门ID和用户ID查询权限
     */
    Optional<PortalPermission> findByPortalIdAndUserId(Long portalId, Long userId);
    
    /**
     * 检查用户是否有传送门权限
     */
    boolean existsByPortalIdAndUserId(Long portalId, Long userId);
    
    /**
     * 删除传送门的所有权限
     */
    void deleteByPortalId(Long portalId);
    
    /**
     * 删除用户对指定传送门的权限
     */
    void deleteByPortalIdAndUserId(Long portalId, Long userId);
}
