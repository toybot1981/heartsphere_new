package com.heartsphere.heartconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.heartconnect.dto.*;
import com.heartsphere.heartconnect.service.ShareConfigService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 共享配置控制器
 */
@RestController
@RequestMapping("/api/heartconnect")
public class ShareConfigController {
    
    @Autowired
    private ShareConfigService shareConfigService;
    
    /**
     * 创建共享配置
     */
    @PostMapping("/config")
    public ApiResponse<ShareConfigDTO> createShareConfig(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CreateShareConfigRequest request) {
        ShareConfigDTO config = shareConfigService.createShareConfig(userDetails.getId(), request);
        return ApiResponse.success("共享配置创建成功", config);
    }
    
    /**
     * 更新共享配置
     */
    @PutMapping("/config/{configId}")
    public ApiResponse<ShareConfigDTO> updateShareConfig(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long configId,
            @RequestBody UpdateShareConfigRequest request) {
        ShareConfigDTO config = shareConfigService.updateShareConfig(userDetails.getId(), configId, request);
        return ApiResponse.success("共享配置更新成功", config);
    }
    
    /**
     * 获取用户的共享配置
     */
    @GetMapping("/config/my")
    public ApiResponse<ShareConfigDTO> getMyShareConfig(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        ShareConfigDTO config = shareConfigService.getShareConfigByUserId(userDetails.getId());
        return ApiResponse.success(config);
    }
    
    /**
     * 根据共享码获取共享配置
     */
    @GetMapping("/config/by-code/{shareCode}")
    public ApiResponse<ShareConfigDTO> getShareConfigByCode(@PathVariable String shareCode) {
        ShareConfigDTO config = shareConfigService.getShareConfigByShareCode(shareCode);
        return ApiResponse.success(config);
    }
    
    /**
     * 重新生成共享码
     */
    @PostMapping("/config/{configId}/regenerate-code")
    public ApiResponse<ShareConfigDTO> regenerateShareCode(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long configId) {
        ShareConfigDTO config = shareConfigService.regenerateShareCode(userDetails.getId(), configId);
        return ApiResponse.success("共享码重新生成成功", config);
    }
    
    /**
     * 删除共享配置
     */
    @DeleteMapping("/config/{configId}")
    public ApiResponse<Void> deleteShareConfig(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long configId) {
        shareConfigService.deleteShareConfig(userDetails.getId(), configId);
        return ApiResponse.success("共享配置删除成功", null);
    }
    
    /**
     * 获取公开的共享心域列表（发现页面）
     */
    @GetMapping("/discover")
    public ApiResponse<List<SharedHeartSphereDTO>> getPublicSharedHeartSpheres(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ShareConfigController.class);
        
        Long userId = null;
        if (userDetails != null) {
            userId = userDetails.getId();
            log.info("获取共享心域列表：用户ID={}", userId);
        } else {
            log.info("获取共享心域列表：用户未登录，返回所有公开的共享心域");
        }
        
        List<SharedHeartSphereDTO> sharedHeartSpheres = shareConfigService.getPublicSharedHeartSpheres(userId);
        log.info("返回共享心域列表：用户ID={}, 数量={}", userId, sharedHeartSpheres.size());
        return ApiResponse.success(sharedHeartSpheres);
    }
}

