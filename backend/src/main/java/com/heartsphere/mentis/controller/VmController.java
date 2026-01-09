package com.heartsphere.mentis.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmManager;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mentis 虚拟机管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mentis/vm")
@RequiredArgsConstructor
public class VmController {
    
    private final VmManager vmManager;
    
    /**
     * 获取虚拟机状态
     */
    @GetMapping("/{sessionId}/status")
    public ResponseEntity<ApiResponse<MentisVmService.VmStatus>> getVmStatus(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getCurrentUserId(authentication);
        
        // 通过会话ID获取虚拟机实例，然后获取状态
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.getVmForSession(sessionId);
        if (vmInstance == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "该会话未关联虚拟机"));
        }
        
        MentisVmService.VmStatus status = vmManager.getVmStatus(vmInstance.getVmId());
        return ResponseEntity.ok(ApiResponse.success(status));
    }
    
    /**
     * 创建快照
     */
    @PostMapping("/{sessionId}/snapshot")
    public ResponseEntity<ApiResponse<Map<String, String>>> createSnapshot(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getCurrentUserId(authentication);
        
        // 通过会话ID获取虚拟机实例，然后创建快照
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.getVmForSession(sessionId);
        if (vmInstance == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "该会话未关联虚拟机"));
        }
        
        String snapshotId = vmManager.createSnapshot(vmInstance.getVmId());
        
        Map<String, String> result = Map.of("snapshotId", snapshotId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 恢复快照
     */
    @PostMapping("/{sessionId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreSnapshot(
            @PathVariable String sessionId,
            @RequestParam String snapshotId,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getCurrentUserId(authentication);
        
        // 通过会话ID获取虚拟机实例，然后恢复快照
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.getVmForSession(sessionId);
        if (vmInstance == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "该会话未关联虚拟机"));
        }
        
        vmManager.restoreSnapshot(vmInstance.getVmId(), snapshotId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 获取虚拟机屏幕截图
     */
    @GetMapping("/{sessionId}/screenshot")
    public ResponseEntity<ApiResponse<Map<String, String>>> getScreenshot(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        // TODO: 实现截图获取逻辑
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getCurrentUserId(authentication);
        
        Map<String, String> result = Map.of(
            "screenshotUrl", "",
            "timestamp", String.valueOf(System.currentTimeMillis())
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 获取虚拟机统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics(
            Authentication authentication) {
        
        // TODO: 权限验证 - 仅管理员可查看统计信息
        Long userId = getCurrentUserId(authentication);
        Map<String, Object> stats = vmManager.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 从Authentication中获取用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("未授权：请重新登录");
        }
        
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new IllegalArgumentException("未授权：请重新登录");
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}
