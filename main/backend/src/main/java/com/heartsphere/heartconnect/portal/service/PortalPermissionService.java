package com.heartsphere.heartconnect.portal.service;

import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.portal.entity.PortalConfig;
import com.heartsphere.heartconnect.portal.entity.PortalPermission;
import com.heartsphere.heartconnect.portal.repository.PortalConfigRepository;
import com.heartsphere.heartconnect.portal.repository.PortalPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 传送门权限服务
 * 参考ConnectionRequestService的权限验证模式
 */
@Service
public class PortalPermissionService {
    
    @Autowired
    private PortalConfigRepository portalConfigRepository;
    
    @Autowired
    private PortalPermissionRepository permissionRepository;
    
    @Autowired
    private ShareConfigQueryService shareConfigQueryService;
    
    /**
     * 检查用户是否可以使用传送门
     * 已移除权限限制：所有激活的传送门都可以使用
     */
    public boolean canUserTeleport(Long userId, Long portalId) {
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PortalPermissionService.class);
        
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        log.debug("[PortalPermissionService] 检查传送权限: userId={}, portalId={}, portalUserId={}, permissionType={}", 
            userId, portalId, portal.getUserId(), portal.getPermissionType());
        
        // 只检查传送门是否激活，不再检查权限
        if (!portal.getIsActive()) {
            log.warn("[PortalPermissionService] 传送门未激活: portalId={}", portalId);
            return false;
        }
        
        // 移除所有权限检查，允许所有人使用激活的传送门
        log.info("[PortalPermissionService] 传送权限检查通过（已移除权限限制）: portalId={}, userId={}", portalId, userId);
        return true;
    }
    
    /**
     * 创建传送门权限（批准或邀请）
     */
    public void grantPermission(Long portalId, Long userId, PortalPermission.PermissionType permissionType, Long invitedBy) {
        // 检查是否已存在权限
        if (permissionRepository.existsByPortalIdAndUserId(portalId, userId)) {
            throw new BusinessException("用户已有此传送门的权限");
        }
        
        PortalPermission permission = new PortalPermission();
        permission.setPortalId(portalId);
        permission.setUserId(userId);
        permission.setPermissionType(permissionType);
        permission.setInvitedBy(invitedBy);
        
        permissionRepository.save(permission);
    }
    
    /**
     * 撤销传送门权限
     */
    public void revokePermission(Long portalId, Long userId) {
        permissionRepository.deleteByPortalIdAndUserId(portalId, userId);
    }
    
    /**
     * 检查用户是否有传送门权限（不检查目标心域）
     * 已移除权限限制：所有激活的传送门都可以使用
     */
    public boolean hasPortalPermission(Long userId, Long portalId) {
        PortalConfig portal = portalConfigRepository.findById(portalId).orElse(null);
        if (portal == null || !portal.getIsActive()) {
            return false;
        }
        
        // 移除所有权限检查，允许所有人使用激活的传送门
        return true;
    }
}
