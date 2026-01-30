package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MentisMcpConfigDTO;
import com.heartsphere.admin.service.MentisManagementService;
import com.heartsphere.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Mentis 管理控制器
 * 提供 MCP 服务器配置管理功能
 */
@RestController
@RequestMapping("/api/admin/mentis")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Mentis Management", description = "Mentis 系统管理 API")
public class MentisManagementController {
    
    private final MentisManagementService mentisManagementService;
    
    /**
     * 获取所有 MCP 配置
     */
    @Operation(summary = "获取所有 MCP 配置", description = "返回系统中所有 MCP 服务器配置列表")
    @GetMapping("/mcp/configs")
    public ResponseEntity<ApiResponse<List<MentisMcpConfigDTO>>> getMcpConfigs() {
        List<MentisMcpConfigDTO> configs = mentisManagementService.getMcpConfigs();
        return ResponseEntity.ok(ApiResponse.success(configs));
    }
    
    /**
     * 根据 ID 获取 MCP 配置
     */
    @Operation(summary = "获取 MCP 配置", description = "根据配置 ID 获取单个 MCP 配置详情")
    @GetMapping("/mcp/configs/{id}")
    public ResponseEntity<ApiResponse<MentisMcpConfigDTO>> getMcpConfig(@PathVariable Long id) {
        MentisMcpConfigDTO config = mentisManagementService.getMcpConfig(id);
        return ResponseEntity.ok(ApiResponse.success(config));
    }
    
    /**
     * 创建 MCP 配置
     */
    @Operation(summary = "创建 MCP 配置", description = "创建新的 MCP 服务器配置")
    @PostMapping("/mcp/configs")
    public ResponseEntity<ApiResponse<MentisMcpConfigDTO>> createMcpConfig(@RequestBody MentisMcpConfigDTO dto) {
        MentisMcpConfigDTO created = mentisManagementService.createMcpConfig(dto);
        return ResponseEntity.ok(ApiResponse.success(created));
    }
    
    /**
     * 更新 MCP 配置
     */
    @PutMapping("/mcp/configs/{id}")
    public ResponseEntity<ApiResponse<MentisMcpConfigDTO>> updateMcpConfig(
            @PathVariable Long id,
            @RequestBody MentisMcpConfigDTO dto) {
        MentisMcpConfigDTO updated = mentisManagementService.updateMcpConfig(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
    
    /**
     * 删除 MCP 配置
     */
    @DeleteMapping("/mcp/configs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMcpConfig(@PathVariable Long id) {
        mentisManagementService.deleteMcpConfig(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 测试 MCP 连接
     */
    @PostMapping("/mcp/configs/{id}/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testMcpConnection(@PathVariable Long id) {
        boolean success = mentisManagementService.testMcpConnection(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("success", success)));
    }
    
    /**
     * 获取 MCP 服务器的可用工具
     */
    @GetMapping("/mcp/configs/{id}/tools")
    public ResponseEntity<ApiResponse<List<Object>>> getMcpTools(@PathVariable Long id) {
        List<Object> tools = mentisManagementService.getMcpTools(id);
        return ResponseEntity.ok(ApiResponse.success(tools));
    }
    
    /**
     * 调用 MCP 工具进行测试
     */
    @PostMapping("/mcp/configs/{id}/tools/{toolName}/call")
    public ResponseEntity<ApiResponse<Map<String, Object>>> callMcpTool(
            @PathVariable Long id,
            @PathVariable String toolName,
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        Map<String, Object> arguments = (Map<String, Object>) request.get("arguments");
        Map<String, Object> result = mentisManagementService.callMcpTool(id, toolName, arguments);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    /**
     * 切换 MCP 配置的启用/禁用状态
     */
    @Operation(summary = "切换 MCP 配置状态", description = "启用或禁用指定的 MCP 服务器配置")
    @PatchMapping("/mcp/configs/{id}/toggle")
    public ResponseEntity<ApiResponse<MentisMcpConfigDTO>> toggleMcpConfig(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        Boolean enabled = request != null ? request.get("enabled") : null;
        MentisMcpConfigDTO updated = mentisManagementService.toggleMcpConfig(id, enabled);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
