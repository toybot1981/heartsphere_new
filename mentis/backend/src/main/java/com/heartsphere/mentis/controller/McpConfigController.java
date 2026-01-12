package com.heartsphere.mentis.controller;

import com.heartsphere.mentis.entity.McpServerConfig;
import com.heartsphere.mentis.service.McpConfigService;
import com.heartsphere.mentis.service.McpClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP 服务器配置管理 API
 */
@RestController
@RequestMapping("/api/mentis/mcp")
@RequiredArgsConstructor
@Slf4j
public class McpConfigController {

    private final McpConfigService mcpConfigService;
    private final McpClientService mcpClientService;

    /**
     * 创建 MCP 服务器配置
     */
    @PostMapping("/configs")
    public ResponseEntity<Map<String, Object>> createConfig(@RequestBody McpServerConfig config) {
        try {
            McpServerConfig created = mcpConfigService.createConfig(config);
            return ResponseEntity.ok(createSuccessResponse(created));
        } catch (Exception e) {
            log.error("Failed to create MCP config", e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 更新 MCP 服务器配置
     */
    @PutMapping("/configs/{id}")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @PathVariable Long id,
            @RequestBody McpServerConfig config) {
        try {
            McpServerConfig updated = mcpConfigService.updateConfig(id, config);
            return ResponseEntity.ok(createSuccessResponse(updated));
        } catch (Exception e) {
            log.error("Failed to update MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 删除 MCP 服务器配置
     */
    @DeleteMapping("/configs/{id}")
    public ResponseEntity<Map<String, Object>> deleteConfig(@PathVariable Long id) {
        try {
            mcpConfigService.deleteConfig(id);
            return ResponseEntity.ok(createSuccessResponse(null));
        } catch (Exception e) {
            log.error("Failed to delete MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 获取 MCP 服务器配置
     */
    @GetMapping("/configs/{id}")
    public ResponseEntity<Map<String, Object>> getConfig(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            return ResponseEntity.ok(createSuccessResponse(config));
        } catch (Exception e) {
            log.error("Failed to get MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 获取所有 MCP 服务器配置
     */
    @GetMapping("/configs")
    public ResponseEntity<Map<String, Object>> getAllConfigs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Boolean enabled) {
        try {
            List<McpServerConfig> configs;
            if (userId != null) {
                configs = mcpConfigService.getUserConfigs(userId);
            } else if (enabled != null && enabled) {
                configs = mcpConfigService.getEnabledConfigs();
            } else {
                configs = mcpConfigService.getAllConfigs();
            }
            return ResponseEntity.ok(createSuccessResponse(configs));
        } catch (Exception e) {
            log.error("Failed to get MCP configs", e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 启用/禁用 MCP 服务器配置
     */
    @PatchMapping("/configs/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleConfig(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean enabled = request.get("enabled");
            McpServerConfig config = mcpConfigService.toggleConfig(id, enabled);
            return ResponseEntity.ok(createSuccessResponse(config));
        } catch (Exception e) {
            log.error("Failed to toggle MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 测试 MCP 服务器连接
     */
    @PostMapping("/configs/{id}/test")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable Long id) {
        try {
            boolean connected = mcpConfigService.testConnection(id);
            Map<String, Object> result = new HashMap<>();
            result.put("connected", connected);
            result.put("message", connected ? "连接成功" : "连接失败");
            return ResponseEntity.ok(createSuccessResponse(result));
        } catch (Exception e) {
            log.error("Failed to test MCP connection: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 列出 MCP 服务器提供的工具
     */
    @GetMapping("/configs/{id}/tools")
    public ResponseEntity<Map<String, Object>> listTools(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            List<Map<String, Object>> tools = mcpClientService.listTools(config);
            return ResponseEntity.ok(createSuccessResponse(tools));
        } catch (Exception e) {
            log.error("Failed to list tools for MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * 调用 MCP 工具
     */
    @PostMapping("/configs/{id}/tools/{toolName}/call")
    public ResponseEntity<Map<String, Object>> callTool(
            @PathVariable Long id,
            @PathVariable String toolName,
            @RequestBody Map<String, Object> request) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            @SuppressWarnings("unchecked")
            Map<String, Object> arguments = (Map<String, Object>) request.get("arguments");
            Map<String, Object> result = mcpClientService.callTool(config, toolName, arguments);
            return ResponseEntity.ok(createSuccessResponse(result));
        } catch (Exception e) {
            log.error("Failed to call tool {} for MCP config: {}", toolName, id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    private Map<String, Object> createSuccessResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "success");
        response.put("data", data);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 500);
        response.put("message", message);
        response.put("data", null);
        return response;
    }
}
