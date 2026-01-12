package com.heartsphere.mentis.controller;

import com.heartsphere.mentis.service.McpConfigService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Mentis 管理控制器
 * 用于 admin 后端调用，重新加载配置
 */
@RestController
@RequestMapping("/api/mentis/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Mentis Admin", description = "Mentis 系统管理 API（供 admin 后端调用）")
public class MentisAdminController {
    
    private final McpConfigService mcpConfigService;
    
    /**
     * 重新加载配置
     * 当 admin 后端修改配置后调用此接口，使 Mentis 重新加载配置
     */
    @Operation(summary = "重新加载配置", description = "通知 Mentis 后端重新加载 MCP 和 Agent 配置")
    @PostMapping("/reload-configs")
    public ResponseEntity<ApiResponse<String>> reloadConfigs() {
        log.info("Reloading Mentis configurations triggered by admin backend");
        
        // 这里可以触发配置重新加载的逻辑
        // 例如：清除缓存、重新初始化服务等
        // 目前 MCP 配置是通过数据库直接读取的，所以不需要特殊处理
        // 如果将来有缓存，需要在这里清除
        
        return ResponseEntity.ok(ApiResponse.success("Configurations reloaded successfully"));
    }
}
