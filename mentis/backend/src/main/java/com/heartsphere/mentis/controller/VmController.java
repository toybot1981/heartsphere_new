package com.heartsphere.mentis.controller;

import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmManager;
import com.heartsphere.mentis.security.UserDetailsImpl;
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
     * 为会话创建虚拟机
     */
    @PostMapping("/{sessionId}/create")
    public ResponseEntity<ApiResponse<MentisVmService.VmInstance>> createVm(
            @PathVariable String sessionId,
            @RequestBody(required = false) MentisVmService.VmConfig config,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限为该会话创建虚拟机
        Long userId = getUserId(authentication);
        
        // 如果没有提供配置，使用默认配置
        if (config == null) {
            config = new MentisVmService.VmConfig();
            // TODO: 从配置文件读取默认值
            config.setImageId("ubuntu:latest");
            config.setCpu(2);
            config.setMemory(2048);
            config.setDisk(20);
        }
        
        // 检查会话是否已有虚拟机
        com.heartsphere.mentis.vm.VmProvider.VmInstance existingVm = vmManager.getVmForSession(sessionId);
        if (existingVm != null) {
            return ResponseEntity.ok(ApiResponse.error(409, "该会话已关联虚拟机"));
        }
        
        // 创建虚拟机
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.createVmForSession(sessionId, config);
        
        // 转换为服务层的 VmInstance
        MentisVmService.VmInstance result = new MentisVmService.VmInstance();
        result.setVmId(vmInstance.getVmId());
        result.setSessionId(sessionId);
        result.setStatus(vmInstance.getStatus());
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 获取虚拟机状态
     */
    @GetMapping("/{sessionId}/status")
    public ResponseEntity<ApiResponse<MentisVmService.VmStatus>> getVmStatus(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getUserId(authentication);
        
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
        Long userId = getUserId(authentication);
        
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
        Long userId = getUserId(authentication);
        
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
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getUserId(authentication);
        
        // 通过会话ID获取虚拟机实例
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.getVmForSession(sessionId);
        if (vmInstance == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "该会话未关联虚拟机"));
        }
        
        // 截图功能已禁用
        // log.debug("截图功能已禁用: sessionId={}, vmId={}", sessionId, vmInstance.getVmId());
        
        Map<String, String> result = new java.util.HashMap<>();
        result.put("screenshotUrl", "");
        result.put("screenshot", "");
        result.put("screenshotDisabled", "true");
        result.put("message", "截图功能已禁用");
        result.put("timestamp", String.valueOf(System.currentTimeMillis()));
        result.put("vmId", vmInstance.getVmId());
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 获取虚拟机 VNC 连接信息
     */
    @GetMapping("/{sessionId}/vnc")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVncInfo(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getUserId(authentication);
        
        // 通过会话ID获取虚拟机实例
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.getVmForSession(sessionId);
        if (vmInstance == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "该会话未关联虚拟机"));
        }
        
        // 获取 VNC 连接信息
        Map<String, Object> vncInfo = vmManager.getVncInfo(vmInstance.getVmId());
        
        if (vncInfo == null || vncInfo.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(404, "无法获取 VNC 连接信息，可能当前 Provider 不支持 VNC"));
        }
        
        return ResponseEntity.ok(ApiResponse.success(vncInfo));
    }
    
    /**
     * 在虚拟机中执行命令
     */
    @PostMapping("/{sessionId}/execute")
    public ResponseEntity<ApiResponse<MentisVmService.CommandResult>> executeCommand(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限访问该会话的虚拟机
        Long userId = getUserId(authentication);
        
        // 获取命令
        String command = requestBody.get("command");
        if (command == null || command.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(400, "命令不能为空"));
        }
        
        // 执行命令
        MentisVmService.CommandResult result = vmManager.executeCommandForSession(sessionId, command);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 删除虚拟机
     */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteVm(
            @PathVariable String sessionId,
            Authentication authentication) {
        
        // TODO: 权限验证 - 验证用户是否有权限删除该会话的虚拟机
        Long userId = getUserId(authentication);
        
        // 通过会话ID删除虚拟机
        com.heartsphere.mentis.vm.VmProvider.VmInstance vmInstance = vmManager.getVmForSession(sessionId);
        if (vmInstance == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "该会话未关联虚拟机"));
        }
        
        vmManager.deleteVmForSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 获取虚拟机统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics(
            Authentication authentication) {
        
        // TODO: 权限验证 - 仅管理员可查看统计信息
        Long userId = getUserId(authentication);
        Map<String, Object> stats = vmManager.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 从Authentication中获取用户ID
     * 如果没有认证信息，返回默认用户ID（允许匿名访问）
     */
    private Long getUserId(Authentication authentication) {
        // 如果没有认证信息，返回默认用户ID（允许匿名访问，使用默认用户）
        if (authentication == null || authentication.getPrincipal() == null) {
            log.warn("未提供认证信息，使用默认用户ID: 1");
            return 1L; // 默认用户ID，允许匿名访问
        }
        
        // 如果 principal 是 UserDetailsImpl 类型，获取用户ID
        if (authentication.getPrincipal() instanceof com.heartsphere.mentis.security.UserDetailsImpl) {
            com.heartsphere.mentis.security.UserDetailsImpl userDetails = 
                (com.heartsphere.mentis.security.UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        
        // 如果 principal 是字符串类型（可能是用户名），返回默认ID
        if (authentication.getPrincipal() instanceof String) {
            log.warn("认证信息为字符串类型（用户名），使用默认用户ID: 1");
            return 1L;
        }
        
        // 其他情况，返回默认ID
        log.warn("未知的认证信息类型，使用默认用户ID: 1");
        return 1L;
    }
}
