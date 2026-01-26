package com.heartsphere.heartconnect.portal.service;

import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.dto.ShareConfigDTO;
import com.heartsphere.heartconnect.portal.config.PortalProperties;
import com.heartsphere.heartconnect.portal.dto.*;
import com.heartsphere.heartconnect.portal.entity.PortalConfig;
import com.heartsphere.heartconnect.portal.entity.PortalTeleportationLog;
import com.heartsphere.heartconnect.portal.repository.PortalConfigRepository;
import com.heartsphere.heartconnect.portal.repository.PortalTeleportationLogRepository;
import com.heartsphere.heartconnect.portal.service.ShareConfigQueryService;
import com.heartsphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 传送门服务
 * 参考ShareConfigService的架构模式
 */
@Service
public class PortalService {
    
    private static final Logger log = LoggerFactory.getLogger(PortalService.class);
    
    @Autowired
    private PortalConfigRepository portalConfigRepository;
    
    @Autowired
    private PortalTeleportationLogRepository teleportationLogRepository;
    
    @Autowired
    private PortalPermissionService permissionService;
    
    @Autowired
    private ShareConfigQueryService shareConfigQueryService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PortalProperties portalProperties;
    
    /**
     * 检查传送门功能是否启用
     */
    private void checkFeatureEnabled() {
        if (!portalProperties.isEnabled()) {
            throw new BusinessException("传送门功能未启用");
        }
    }
    
    /**
     * 创建传送门
     */
    @Transactional
    public PortalConfigDTO createPortal(Long userId, CreatePortalRequest request) {
        checkFeatureEnabled();
        
        // 检查用户是否存在
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("用户不存在");
        }
        
        // 验证目标心域
        Long targetHeartsphereId = null;
        String targetShareCode = null;
        
        if (request.getTargetHeartsphereId() != null) {
            targetHeartsphereId = request.getTargetHeartsphereId();
        } else if (request.getTargetShareCode() != null && !request.getTargetShareCode().isEmpty()) {
            try {
                ShareConfigDTO shareConfig = shareConfigQueryService.getShareConfigByCode(request.getTargetShareCode());
                targetHeartsphereId = shareConfig.getUserId();
                targetShareCode = request.getTargetShareCode();
            } catch (Exception e) {
                throw new BusinessException("目标心域共享码无效: " + e.getMessage());
            }
        } else {
            throw new BusinessException("必须指定目标心域ID或共享码");
        }
        
        // 检查是否传送到自己的心域
        if (targetHeartsphereId.equals(userId)) {
            throw new BusinessException("不能创建指向自己心域的传送门");
        }
        
        // 创建传送门配置
        PortalConfig portal = new PortalConfig();
        portal.setUserId(userId);
        portal.setSceneId(request.getSceneId());
        portal.setPortalName(request.getPortalName());
        portal.setPortalType(PortalConfig.PortalType.valueOf(request.getPortalType().toUpperCase()));
        portal.setTargetHeartsphereId(targetHeartsphereId);
        portal.setTargetShareCode(targetShareCode);
        portal.setPositionX(request.getPositionX() != null ? request.getPositionX() : 0.0);
        portal.setPositionY(request.getPositionY() != null ? request.getPositionY() : 0.0);
        portal.setPositionZ(request.getPositionZ() != null ? request.getPositionZ() : 0.0);
        portal.setSize(request.getSize() != null ? request.getSize() : 3.0);
        portal.setPermissionType(PortalConfig.PermissionType.valueOf(
            request.getPermissionType() != null ? request.getPermissionType().toUpperCase() : "APPROVAL"));
        portal.setDescription(request.getDescription());
        portal.setIsActive(true);
        
        portal = portalConfigRepository.save(portal);
        
        log.info("创建传送门: portalId={}, userId={}, sceneId={}, targetHeartsphereId={}", 
            portal.getId(), userId, request.getSceneId(), targetHeartsphereId);
        
        return convertToDTO(portal);
    }
    
    /**
     * 更新传送门
     */
    @Transactional
    public PortalConfigDTO updatePortal(Long userId, Long portalId, UpdatePortalRequest request) {
        checkFeatureEnabled();
        
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        // 检查权限
        if (!portal.getUserId().equals(userId)) {
            throw new BusinessException("无权修改此传送门");
        }
        
        // 更新配置
        if (request.getPortalName() != null) {
            portal.setPortalName(request.getPortalName());
        }
        if (request.getPortalType() != null) {
            portal.setPortalType(PortalConfig.PortalType.valueOf(request.getPortalType().toUpperCase()));
        }
        if (request.getTargetHeartsphereId() != null) {
            portal.setTargetHeartsphereId(request.getTargetHeartsphereId());
        }
        if (request.getTargetShareCode() != null) {
            portal.setTargetShareCode(request.getTargetShareCode());
        }
        if (request.getPositionX() != null) {
            portal.setPositionX(request.getPositionX());
        }
        if (request.getPositionY() != null) {
            portal.setPositionY(request.getPositionY());
        }
        if (request.getPositionZ() != null) {
            portal.setPositionZ(request.getPositionZ());
        }
        if (request.getSize() != null) {
            portal.setSize(request.getSize());
        }
        if (request.getPermissionType() != null) {
            portal.setPermissionType(PortalConfig.PermissionType.valueOf(request.getPermissionType().toUpperCase()));
        }
        if (request.getDescription() != null) {
            portal.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            portal.setIsActive(request.getIsActive());
        }
        
        portal = portalConfigRepository.save(portal);
        
        return convertToDTO(portal);
    }
    
    /**
     * 删除传送门
     */
    @Transactional
    public void deletePortal(Long userId, Long portalId) {
        checkFeatureEnabled();
        
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        // 检查权限
        if (!portal.getUserId().equals(userId)) {
            throw new BusinessException("无权删除此传送门");
        }
        
        portalConfigRepository.delete(portal);
        log.info("删除传送门: portalId={}, userId={}", portalId, userId);
    }
    
    /**
     * 根据场景ID获取传送门列表
     */
    public List<PortalConfigDTO> getPortalsByScene(Long sceneId, Boolean onlyActive) {
        checkFeatureEnabled();
        
        try {
            List<PortalConfig> portals;
            if (onlyActive != null && onlyActive) {
                log.info("查询场景 {} 的激活传送门", sceneId);
                portals = portalConfigRepository.findBySceneIdAndIsActive(sceneId, true);
            } else {
                log.info("查询场景 {} 的所有传送门", sceneId);
                portals = portalConfigRepository.findBySceneId(sceneId);
            }
            
            log.info("找到 {} 个传送门", portals.size());
            
            return portals.stream()
                    .map(portal -> {
                        try {
                            return convertToDTO(portal);
                        } catch (Exception e) {
                            log.error("转换传送门DTO失败: portalId={}, error={}", portal.getId(), e.getMessage(), e);
                            throw new RuntimeException("转换传送门数据失败: " + e.getMessage(), e);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取场景 {} 的传送门列表失败: {}", sceneId, e.getMessage(), e);
            throw new RuntimeException("获取传送门列表失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 根据ID获取传送门详情
     */
    public PortalConfigDTO getPortalById(Long portalId) {
        checkFeatureEnabled();
        
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        return convertToDTO(portal);
    }
    
    /**
     * 验证传送权限
     */
    public boolean validateTeleportationPermission(Long userId, Long portalId) {
        checkFeatureEnabled();
        
        return permissionService.canUserTeleport(userId, portalId);
    }
    
    /**
     * 执行传送
     */
    @Transactional
    public TeleportationResult executeTeleportation(Long userId, Long portalId, Boolean skipAnimation) {
        checkFeatureEnabled();
        
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        // 验证权限
        boolean canTeleport = permissionService.canUserTeleport(userId, portalId);
        log.info("[PortalService] 传送权限检查结果: userId={}, portalId={}, canTeleport={}", userId, portalId, canTeleport);
        
        if (!canTeleport) {
            PortalTeleportationLog logEntry = new PortalTeleportationLog();
            logEntry.setPortalId(portalId);
            logEntry.setVisitorId(userId);
            logEntry.setStatus(PortalTeleportationLog.Status.FAILED);
            logEntry.setErrorMessage("无权限传送");
            teleportationLogRepository.save(logEntry);
            
            log.warn("[PortalService] 传送权限检查失败: userId={}, portalId={}, portalUserId={}, permissionType={}", 
                userId, portalId, portal.getUserId(), portal.getPermissionType());
            throw new BusinessException("无权限使用此传送门");
        }
        
        // 记录传送日志
        long startTime = System.currentTimeMillis();
        
        PortalTeleportationLog teleportLog = new PortalTeleportationLog();
        teleportLog.setPortalId(portalId);
        teleportLog.setVisitorId(userId);
        teleportLog.setSourceHeartsphereId(portal.getUserId());
        // sourceSceneId 和 targetSceneId 需要从请求中获取，这里简化处理
        teleportLog.setTargetHeartsphereId(portal.getTargetHeartsphereId());
        teleportLog.setStatus(PortalTeleportationLog.Status.SUCCESS);
        
        teleportLog = teleportationLogRepository.save(teleportLog);
        
        long duration = System.currentTimeMillis() - startTime;
        teleportLog.setDurationMs((int) duration);
        teleportationLogRepository.save(teleportLog);
        
        // 构建返回结果
        TeleportationResult result = new TeleportationResult();
        result.setSuccess(true);
        result.setTargetHeartsphereId(portal.getTargetHeartsphereId());
        result.setTargetShareCode(portal.getTargetShareCode());
        result.setDurationMs((int) duration);
        
        log.info("执行传送: portalId={}, userId={}, targetHeartsphereId={}, duration={}ms", 
            portalId, userId, portal.getTargetHeartsphereId(), duration);
        
        return result;
    }
    
    /**
     * 获取目标心域预览信息
     */
    public PortalPreviewDTO getPortalPreview(Long portalId, Long currentUserId) {
        checkFeatureEnabled();
        
        PortalConfig portal = portalConfigRepository.findById(portalId)
                .orElseThrow(() -> new ResourceNotFoundException("传送门不存在"));
        
        PortalPreviewDTO preview = new PortalPreviewDTO();
        preview.setTargetHeartsphereId(portal.getTargetHeartsphereId());
        
        // 通过共享码获取目标心域信息
        if (portal.getTargetShareCode() != null) {
            try {
                ShareConfigDTO shareConfig = shareConfigQueryService.getShareConfigByCode(portal.getTargetShareCode());
                preview.setTargetHeartsphereName(shareConfig.getOwnerName() + "的心域");
                preview.setTargetOwnerName(shareConfig.getOwnerName());
                preview.setTargetCoverImageUrl(shareConfig.getCoverImageUrl());
                preview.setTargetDescription(shareConfig.getDescription());
                preview.setTargetAccessPermission(shareConfig.getAccessPermission());
                
                // 检查当前用户是否可以访问
                boolean canAccess = shareConfigQueryService.canUserAccess(currentUserId, portal.getTargetShareCode());
                preview.setCanAccess(canAccess);
                
                if (!canAccess) {
                    preview.setCannotAccessReason("无权限访问目标心域");
                }
            } catch (Exception e) {
                preview.setCanAccess(false);
                preview.setCannotAccessReason("目标心域不存在或已失效: " + e.getMessage());
            }
        }
        
        return preview;
    }
    
    /**
     * 转换为DTO
     */
    private PortalConfigDTO convertToDTO(PortalConfig portal) {
        PortalConfigDTO dto = new PortalConfigDTO();
        dto.setId(portal.getId());
        dto.setUserId(portal.getUserId());
        dto.setSceneId(portal.getSceneId());
        dto.setPortalName(portal.getPortalName());
        dto.setPortalType(portal.getPortalType().name().toLowerCase());
        dto.setTargetHeartsphereId(portal.getTargetHeartsphereId());
        dto.setTargetShareCode(portal.getTargetShareCode());
        dto.setPositionX(portal.getPositionX());
        dto.setPositionY(portal.getPositionY());
        dto.setPositionZ(portal.getPositionZ());
        dto.setSize(portal.getSize());
        dto.setPermissionType(portal.getPermissionType().name().toLowerCase());
        dto.setDescription(portal.getDescription());
        dto.setIsActive(portal.getIsActive());
        
        if (portal.getCreatedAt() != null) {
            dto.setCreatedAt(Instant.from(portal.getCreatedAt().atZone(ZoneId.systemDefault())).toEpochMilli());
        }
        if (portal.getUpdatedAt() != null) {
            dto.setUpdatedAt(Instant.from(portal.getUpdatedAt().atZone(ZoneId.systemDefault())).toEpochMilli());
        }
        
        // 尝试获取目标心域信息
        if (portal.getTargetShareCode() != null) {
            try {
                ShareConfigDTO shareConfig = shareConfigQueryService.getShareConfigByCode(portal.getTargetShareCode());
                dto.setTargetHeartsphereName(shareConfig.getOwnerName() + "的心域");
                dto.setTargetOwnerName(shareConfig.getOwnerName());
                dto.setTargetCoverImageUrl(shareConfig.getCoverImageUrl());
            } catch (Exception e) {
                // 忽略错误，只记录日志
                log.warn("获取目标心域信息失败: shareCode={}, error={}", portal.getTargetShareCode(), e.getMessage());
            }
        }
        
        return dto;
    }
    
    /**
     * 传送结果
     */
    @lombok.Data
    public static class TeleportationResult {
        private boolean success;
        private Long targetHeartsphereId;
        private String targetShareCode;
        private Integer durationMs;
        private String errorMessage;
    }
}
