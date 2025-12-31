package com.heartsphere.heartconnect.service;

import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.dto.*;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.entity.HeartSphereShareScope;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.repository.HeartSphereShareScopeRepository;
import com.heartsphere.heartconnect.util.ShareCodeGenerator;
import com.heartsphere.heartconnect.service.ConnectionRequestService;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 共享配置服务
 */
@Service
public class ShareConfigService {
    
    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;
    
    @Autowired
    private HeartSphereShareScopeRepository shareScopeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private ConnectionRequestService connectionRequestService;
    
    /**
     * 创建共享配置
     */
    @Transactional
    public ShareConfigDTO createShareConfig(Long userId, CreateShareConfigRequest request) {
        // 检查用户是否存在
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("用户不存在");
        }
        
        // 检查是否已有共享配置
        if (shareConfigRepository.existsByUserId(userId)) {
            throw new BusinessException("您已经创建了共享配置，请先关闭或修改现有配置");
        }
        
        // 生成共享码
        String shareCode = generateUniqueShareCode();
        
        // 创建共享配置
        HeartSphereShareConfig config = new HeartSphereShareConfig();
        config.setUserId(userId);
        config.setShareCode(shareCode);
        config.setShareType(HeartSphereShareConfig.ShareType.valueOf(request.getShareType().toUpperCase()));
        config.setShareStatus(HeartSphereShareConfig.ShareStatus.ACTIVE);
        config.setAccessPermission(HeartSphereShareConfig.AccessPermission.valueOf(request.getAccessPermission().toUpperCase()));
        config.setDescription(request.getDescription());
        config.setCoverImageUrl(request.getCoverImageUrl());
        config.setViewCount(0);
        config.setRequestCount(0);
        config.setApprovedCount(0);
        
        if (request.getExpiresAt() != null) {
            config.setExpiresAt(LocalDateTime.ofEpochSecond(request.getExpiresAt() / 1000, 0, java.time.ZoneOffset.UTC));
        }
        
        config = shareConfigRepository.save(config);
        
        // 保存共享范围
        if (request.getScopes() != null && !request.getScopes().isEmpty()) {
            saveShareScopes(config.getId(), request.getScopes());
        }
        
        return convertToDTO(config);
    }
    
    /**
     * 更新共享配置
     */
    @Transactional
    public ShareConfigDTO updateShareConfig(Long userId, Long configId, UpdateShareConfigRequest request) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        // 检查权限
        if (!config.getUserId().equals(userId)) {
            throw new BusinessException("无权修改此共享配置");
        }
        
        // 更新配置
        if (request.getShareType() != null) {
            config.setShareType(HeartSphereShareConfig.ShareType.valueOf(request.getShareType().toUpperCase()));
        }
        if (request.getShareStatus() != null) {
            config.setShareStatus(HeartSphereShareConfig.ShareStatus.valueOf(request.getShareStatus().toUpperCase()));
        }
        if (request.getAccessPermission() != null) {
            config.setAccessPermission(HeartSphereShareConfig.AccessPermission.valueOf(request.getAccessPermission().toUpperCase()));
        }
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        if (request.getCoverImageUrl() != null) {
            config.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getExpiresAt() != null) {
            config.setExpiresAt(LocalDateTime.ofEpochSecond(request.getExpiresAt() / 1000, 0, java.time.ZoneOffset.UTC));
        }
        
        config = shareConfigRepository.save(config);
        
        // 更新共享范围
        if (request.getScopes() != null) {
            shareScopeRepository.deleteByShareConfigId(configId);
            if (!request.getScopes().isEmpty()) {
                saveShareScopesForUpdate(configId, request.getScopes());
            }
        }
        
        return convertToDTO(config);
    }
    
    /**
     * 获取用户的共享配置
     */
    public ShareConfigDTO getShareConfigByUserId(Long userId) {
        HeartSphereShareConfig config = shareConfigRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        return convertToDTO(config);
    }
    
    /**
     * 根据共享码获取共享配置
     */
    public ShareConfigDTO getShareConfigByShareCode(String shareCode) {
        HeartSphereShareConfig config = shareConfigRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new ResourceNotFoundException("共享码不存在或已失效"));
        
        // 检查状态
        if (config.getShareStatus() != HeartSphereShareConfig.ShareStatus.ACTIVE) {
            throw new BusinessException("该共享已暂停或已关闭");
        }
        
        // 检查是否过期
        if (config.getExpiresAt() != null && config.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("该共享已过期");
        }
        
        // 增加查看次数
        config.setViewCount(config.getViewCount() + 1);
        shareConfigRepository.save(config);
        
        return convertToDTO(config);
    }
    
    /**
     * 重新生成共享码
     */
    @Transactional
    public ShareConfigDTO regenerateShareCode(Long userId, Long configId) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        if (!config.getUserId().equals(userId)) {
            throw new BusinessException("无权修改此共享配置");
        }
        
        String newShareCode = generateUniqueShareCode();
        config.setShareCode(newShareCode);
        config = shareConfigRepository.save(config);
        
        return convertToDTO(config);
    }
    
    /**
     * 删除共享配置
     */
    @Transactional
    public void deleteShareConfig(Long userId, Long configId) {
        HeartSphereShareConfig config = shareConfigRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        if (!config.getUserId().equals(userId)) {
            throw new BusinessException("无权删除此共享配置");
        }
        
        shareConfigRepository.delete(config);
    }
    
    /**
     * 获取公开的共享心域列表（发现页面）
     */
    public List<SharedHeartSphereDTO> getPublicSharedHeartSpheres(Long currentUserId) {
        // 获取所有激活的共享配置
        List<HeartSphereShareConfig> configs = shareConfigRepository.findByShareStatus(
            HeartSphereShareConfig.ShareStatus.ACTIVE
        );
        
        // 记录日志
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ShareConfigService.class);
        log.info("获取公开共享心域列表: 当前用户ID={}, 找到{}个激活的共享配置", currentUserId, configs.size());
        
        // 如果currentUserId为null（未登录），返回所有激活的共享配置
        List<SharedHeartSphereDTO> result;
        if (currentUserId == null) {
            result = configs.stream()
                .map(config -> {
                    log.debug("转换共享配置为DTO（未登录用户）: configId={}, shareCode={}, ownerId={}", 
                        config.getId(), config.getShareCode(), config.getUserId());
                    return convertToSharedDTO(config, null);
                })
                .collect(Collectors.toList());
        } else {
            result = configs.stream()
                .filter(config -> {
                    // 排除自己的
                    boolean isNotOwn = !config.getUserId().equals(currentUserId);
                    if (!isNotOwn) {
                        log.debug("排除自己的共享配置: configId={}, userId={}", config.getId(), config.getUserId());
                    }
                    return isNotOwn;
                })
                .map(config -> {
                    log.debug("转换共享配置为DTO: configId={}, shareCode={}, ownerId={}", 
                        config.getId(), config.getShareCode(), config.getUserId());
                    return convertToSharedDTO(config, currentUserId);
                })
                .collect(Collectors.toList());
        }
        
        log.info("返回{}个共享心域", result.size());
        return result;
    }
    
    /**
     * 转换为SharedHeartSphereDTO
     */
    private SharedHeartSphereDTO convertToSharedDTO(HeartSphereShareConfig config, Long currentUserId) {
        SharedHeartSphereDTO dto = new SharedHeartSphereDTO();
        dto.setShareConfigId(config.getId());
        dto.setShareCode(config.getShareCode());
        dto.setOwnerId(config.getUserId());
        
        // 获取主人信息
        userRepository.findById(config.getUserId()).ifPresent(user -> {
            dto.setOwnerName(user.getUsername());
            // dto.setOwnerAvatar(user.getAvatarUrl()); // 如果User实体有avatarUrl字段
            dto.setHeartSphereName(user.getUsername() + "的心域");
        });
        
        dto.setDescription(config.getDescription());
        dto.setCoverImageUrl(config.getCoverImageUrl());
        dto.setShareType(config.getShareType().name().toLowerCase());
        dto.setAccessPermission(config.getAccessPermission().name().toLowerCase());
        dto.setViewCount(config.getViewCount());
        dto.setRequestCount(config.getRequestCount());
        dto.setApprovedCount(config.getApprovedCount());
        
        // 统计共享范围
        List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(config.getId());
        dto.setWorldCount((int) scopes.stream().filter(s -> s.getScopeType() == HeartSphereShareScope.ScopeType.WORLD).count());
        dto.setEraCount((int) scopes.stream().filter(s -> s.getScopeType() == HeartSphereShareScope.ScopeType.ERA).count());
        
        // 检查当前用户是否已发送连接请求
        if (connectionRequestService != null && currentUserId != null) {
            try {
                var request = connectionRequestService.getConnectionRequestByShareConfigAndRequester(
                    config.getId(), currentUserId
                );
                if (request.isPresent()) {
                    var req = request.get();
                    dto.setRequestStatus(req.getRequestStatus().name().toLowerCase());
                    if (req.getRequestedAt() != null) {
                        dto.setRequestedAt(java.time.Instant.from(req.getRequestedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
                    }
                }
            } catch (Exception e) {
                // 忽略错误，继续处理
            }
        }
        
        return dto;
    }
    
    /**
     * 保存共享范围（创建时使用）
     */
    private void saveShareScopes(Long shareConfigId, List<CreateShareConfigRequest.ShareScopeItem> scopes) {
        for (CreateShareConfigRequest.ShareScopeItem item : scopes) {
            HeartSphereShareScope scope = new HeartSphereShareScope();
            scope.setShareConfigId(shareConfigId);
            scope.setScopeType(HeartSphereShareScope.ScopeType.valueOf(item.getScopeType().toUpperCase()));
            scope.setScopeId(item.getScopeId());
            shareScopeRepository.save(scope);
        }
    }
    
    /**
     * 保存共享范围（更新时使用）
     */
    private void saveShareScopesForUpdate(Long shareConfigId, List<UpdateShareConfigRequest.ShareScopeItem> scopes) {
        for (UpdateShareConfigRequest.ShareScopeItem item : scopes) {
            HeartSphereShareScope scope = new HeartSphereShareScope();
            scope.setShareConfigId(shareConfigId);
            scope.setScopeType(HeartSphereShareScope.ScopeType.valueOf(item.getScopeType().toUpperCase()));
            scope.setScopeId(item.getScopeId());
            shareScopeRepository.save(scope);
        }
    }
    
    /**
     * 生成唯一的共享码
     */
    private String generateUniqueShareCode() {
        String shareCode;
        int attempts = 0;
        do {
            shareCode = ShareCodeGenerator.generate();
            attempts++;
            if (attempts > 10) {
                throw new BusinessException("生成共享码失败，请重试");
            }
        } while (shareConfigRepository.findByShareCode(shareCode).isPresent());
        return shareCode;
    }
    
    /**
     * 转换为DTO
     */
    private ShareConfigDTO convertToDTO(HeartSphereShareConfig config) {
        ShareConfigDTO dto = new ShareConfigDTO();
        dto.setId(config.getId());
        dto.setUserId(config.getUserId());
        dto.setShareCode(config.getShareCode());
        dto.setShareType(config.getShareType().name().toLowerCase());
        dto.setShareStatus(config.getShareStatus().name().toLowerCase());
        dto.setAccessPermission(config.getAccessPermission().name().toLowerCase());
        dto.setDescription(config.getDescription());
        dto.setCoverImageUrl(config.getCoverImageUrl());
        dto.setViewCount(config.getViewCount());
        dto.setRequestCount(config.getRequestCount());
        dto.setApprovedCount(config.getApprovedCount());
        
        if (config.getCreatedAt() != null) {
            dto.setCreatedAt(java.time.Instant.from(config.getCreatedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        if (config.getUpdatedAt() != null) {
            dto.setUpdatedAt(java.time.Instant.from(config.getUpdatedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        if (config.getExpiresAt() != null) {
            dto.setExpiresAt(java.time.Instant.from(config.getExpiresAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        
        // 加载共享范围
        List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(config.getId());
        dto.setScopes(scopes.stream().map(this::convertScopeToDTO).collect(Collectors.toList()));
        
        return dto;
    }
    
    /**
     * 转换共享范围为DTO
     */
    private ShareScopeDTO convertScopeToDTO(HeartSphereShareScope scope) {
        ShareScopeDTO dto = new ShareScopeDTO();
        dto.setId(scope.getId());
        dto.setShareConfigId(scope.getShareConfigId());
        dto.setScopeType(scope.getScopeType().name().toLowerCase());
        dto.setScopeId(scope.getScopeId());
        if (scope.getCreatedAt() != null) {
            dto.setCreatedAt(java.time.Instant.from(scope.getCreatedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        return dto;
    }
}

