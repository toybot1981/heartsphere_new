package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MultiAgentSystemConfigDTO;
import com.heartsphere.admin.service.MultiAgentConfigAdminService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 多智能体系统配置管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/multi-agent/config")
@RequiredArgsConstructor
@Tag(name = "Multi-Agent Config Admin", description = "多智能体系统配置管理 API")
public class MultiAgentConfigAdminController extends BaseAdminController {
    
    private final MultiAgentConfigAdminService configService;
    
    /**
     * 获取系统配置
     */
    @Operation(summary = "获取系统配置")
    @GetMapping
    public ResponseEntity<ApiResponse<MultiAgentSystemConfigDTO>> getSystemConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        validateAdmin(authHeader);
        
        MultiAgentSystemConfigDTO config = configService.getSystemConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }
    
    /**
     * 更新系统配置
     */
    @Operation(summary = "更新系统配置")
    @PutMapping
    public ResponseEntity<ApiResponse<Void>> updateSystemConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody MultiAgentSystemConfigDTO configDTO) {
        
        validateAdmin(authHeader);
        
        configService.updateSystemConfig(configDTO);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
