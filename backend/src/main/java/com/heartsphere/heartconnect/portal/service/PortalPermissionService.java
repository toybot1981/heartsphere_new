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
     */
    public boolean canUserTeleport(Long userId, Long portalId) {
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        // 检查传送门是否激活
        if (!portal.getIsActive()) {
            return false;
        }
        
        // 检查传送门权限
        boolean hasPortalPermission = false;
        
        switch (portal.getPermissionType()) {
            case PUBLIC:
                // 公开传送门，所有人都可以使用
                hasPortalPermission = true;
                break;
                
            case APPROVAL:
                // 需要审批，检查是否已批准
                hasPortalPermission = permissionRepository.existsByPortalIdAndUserId(portalId, userId);
                if (!hasPortalPermission) {
                    // 如果是主人自己，也可以使用
                    hasPortalPermission = portal.getUserId().equals(userId);
                }
                break;
                
            case INVITE:
                // 邀请制，检查是否被邀请
                hasPortalPermission = permissionRepository.existsByPortalIdAndUserId(portalId, userId);
                if (!hasPortalPermission) {
                    // 如果是主人自己，也可以使用
                    hasPortalPermission = portal.getUserId().equals(userId);
                }
                break;
        }
        
        if (!hasPortalPermission) {
            return false;
        }
        
        // 检查目标心域权限
        if (portal.getTargetShareCode() != null) {
            try {
                boolean canAccessTarget = shareConfigQueryService.canUserAccess(userId, portal.getTargetShareCode());
                if (!canAccessTarget) {
                    return false;
                }
            } catch (Exception e) {
                // 目标心域不存在或无效
                return false;
            }
        }
        
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
     */
    public boolean hasPortalPermission(Long userId, Long portalId) {
        PortalConfig portal = portalConfigRepository.findById(portalId).orElse(null);
        if (portal == null || !portal.getIsActive()) {
            return false;
        }
        
        // 主人自己有权限
        if (portal.getUserId().equals(userId)) {
            return true;
        }
        
        switch (portal.getPermissionType()) {
            case PUBLIC:
                return true;
            case APPROVAL:
            case INVITE:
                return permissionRepository.existsByPortalIdAndUserId(portalId, userId);
            default:
                return false;
        }
    }
}
