package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MultiAgentRoutingConfigDTO;
import com.heartsphere.admin.service.MultiAgentRoutingAdminService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 多智能体路由管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/multi-agent/routing")
@RequiredArgsConstructor
@Tag(name = "Multi-Agent Routing Admin", description = "多智能体路由管理 API")
public class MultiAgentRoutingAdminController extends BaseAdminController {
    
    private final MultiAgentRoutingAdminService routingService;
    
    /**
     * 获取路由配置
     */
    @Operation(summary = "获取路由配置")
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<MultiAgentRoutingConfigDTO>> getRoutingConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        validateAdmin(authHeader);
        
        MultiAgentRoutingConfigDTO config = routingService.getRoutingConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }
    
    /**
     * 更新路由配置
     */
    @Operation(summary = "更新路由配置")
    @PutMapping("/config")
    public ResponseEntity<ApiResponse<Void>> updateRoutingConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody MultiAgentRoutingConfigDTO configDTO) {
        
        validateAdmin(authHeader);
        
        routingService.updateRoutingConfig(configDTO);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 测试路由策略
     */
    @Operation(summary = "测试路由策略")
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testRoutingStrategy(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> request) {
        
        validateAdmin(authHeader);
        
        // 支持 "task" 或 "request" 字段（向后兼容）
        String testRequest = request.get("task");
        if (testRequest == null) {
            testRequest = request.get("request");
        }
        if (testRequest == null) {
            throw new IllegalArgumentException("Missing required field: 'task' or 'request'");
        }
        
        Map<String, Object> result = routingService.testRoutingStrategy(testRequest);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
