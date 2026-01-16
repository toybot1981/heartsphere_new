package com.heartsphere.heartconnect.portal.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.heartconnect.portal.dto.*;
import com.heartsphere.heartconnect.portal.service.PortalService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 传送门控制器
 * 参考ShareConfigController的设计模式
 */
@RestController
@RequestMapping("/api/portal")
public class PortalController {
    
    @Autowired
    private PortalService portalService;
    
    /**
     * 创建传送门
     */
    @PostMapping("")
    public ApiResponse<PortalConfigDTO> createPortal(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CreatePortalRequest request) {
        if (userDetails == null) {
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        PortalConfigDTO portal = portalService.createPortal(userDetails.getId(), request);
        return ApiResponse.success("传送门创建成功", portal);
    }
    
    /**
     * 更新传送门
     */
    @PutMapping("/{portalId}")
    public ApiResponse<PortalConfigDTO> updatePortal(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long portalId,
            @RequestBody UpdatePortalRequest request) {
        if (userDetails == null) {
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        PortalConfigDTO portal = portalService.updatePortal(userDetails.getId(), portalId, request);
        return ApiResponse.success("传送门更新成功", portal);
    }
    
    /**
     * 删除传送门
     */
    @DeleteMapping("/{portalId}")
    public ApiResponse<Void> deletePortal(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long portalId) {
        if (userDetails == null) {
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        portalService.deletePortal(userDetails.getId(), portalId);
        return ApiResponse.success("传送门删除成功", null);
    }
    
    /**
     * 获取场景的传送门列表
     */
    @GetMapping("/scene/{sceneId}")
    public ApiResponse<List<PortalConfigDTO>> getPortalsByScene(
            @PathVariable Long sceneId,
            @RequestParam(required = false) Boolean onlyActive) {
        List<PortalConfigDTO> portals = portalService.getPortalsByScene(sceneId, onlyActive);
        return ApiResponse.success(portals);
    }
    
    /**
     * 获取传送门详情
     */
    @GetMapping("/{portalId}")
    public ApiResponse<PortalConfigDTO> getPortalById(@PathVariable Long portalId) {
        PortalConfigDTO portal = portalService.getPortalById(portalId);
        return ApiResponse.success(portal);
    }
    
    /**
     * 获取传送门目标心域预览
     */
    @GetMapping("/{portalId}/preview")
    public ApiResponse<PortalPreviewDTO> getPortalPreview(
            @PathVariable Long portalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        PortalPreviewDTO preview = portalService.getPortalPreview(portalId, userId);
        return ApiResponse.success(preview);
    }
    
    /**
     * 执行传送
     */
    @PostMapping("/{portalId}/teleport")
    public ApiResponse<PortalService.TeleportationResult> executeTeleportation(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long portalId,
            @RequestBody(required = false) TeleportationRequest request) {
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PortalController.class);
        log.info("========== [PortalController] 收到传送请求 ==========");
        log.info("portalId: {}, skipAnimation: {}, userDetails: {}", 
            portalId, request != null ? request.getSkipAnimation() : false, 
            userDetails != null ? "已登录(userId=" + userDetails.getId() + ")" : "未登录");
        
        if (userDetails == null) {
            log.warn("[PortalController] 传送请求失败：用户未登录");
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        
        Boolean skipAnimation = request != null ? request.getSkipAnimation() : false;
        log.info("[PortalController] 开始执行传送: userId={}, portalId={}, skipAnimation={}", 
            userDetails.getId(), portalId, skipAnimation);
        
        try {
            PortalService.TeleportationResult result = portalService.executeTeleportation(
                userDetails.getId(), portalId, skipAnimation);
            log.info("[PortalController] 传送成功: userId={}, portalId={}, targetHeartsphereId={}, targetShareCode={}", 
                userDetails.getId(), portalId, result.getTargetHeartsphereId(), result.getTargetShareCode());
            return ApiResponse.success("传送成功", result);
        } catch (Exception e) {
            log.error("[PortalController] 传送失败: userId={}, portalId={}", 
                userDetails.getId(), portalId, e);
            throw e;
        }
    }
    
    /**
     * 请求传送权限（如果需要审批）
     */
    @PostMapping("/{portalId}/request")
    public ApiResponse<Void> requestPortalPermission(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long portalId) {
        if (userDetails == null) {
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        // TODO: 实现权限请求逻辑（后续扩展）
        return ApiResponse.success("权限请求已发送", null);
    }
    
    /**
     * 发送传送门邀请
     */
    @PostMapping("/{portalId}/invite")
    public ApiResponse<Void> inviteUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long portalId,
            @RequestBody InviteUserRequest request) {
        if (userDetails == null) {
            throw new com.heartsphere.exception.UnauthorizedException("未登录，请先登录");
        }
        // TODO: 实现邀请逻辑（后续扩展）
        return ApiResponse.success("邀请已发送", null);
    }
    
}
