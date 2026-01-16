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
    private final com.heartsphere.mentis.service.McpHealthMonitor mcpHealthMonitor;
    private final com.heartsphere.mentis.service.McpToolDiscoveryService mcpToolDiscoveryService;

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
    
    /**
     * 从模板创建配置
     */
    @PostMapping("/configs/from-template/{templateId}")
    public ResponseEntity<Map<String, Object>> createConfigFromTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, String> parameters) {
        try {
            McpServerConfig config = mcpConfigService.createConfigFromTemplate(templateId, parameters);
            return ResponseEntity.ok(createSuccessResponse(config));
        } catch (Exception e) {
            log.error("Failed to create config from template: {}", templateId, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 检查单个服务的健康状态
     */
    @PostMapping("/configs/{id}/health")
    public ResponseEntity<Map<String, Object>> checkHealth(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            com.heartsphere.mentis.service.McpHealthMonitor.HealthStatus status = 
                    mcpHealthMonitor.checkHealth(config).get();
            return ResponseEntity.ok(createSuccessResponse(status));
        } catch (Exception e) {
            log.error("Failed to check health for MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 获取所有服务的健康状态
     */
    @GetMapping("/configs/health")
    public ResponseEntity<Map<String, Object>> getAllHealthStatus() {
        try {
            List<McpServerConfig> configs = mcpConfigService.getEnabledConfigs();
            List<com.heartsphere.mentis.service.McpHealthMonitor.HealthStatus> statuses = 
                    configs.stream()
                            .map(config -> {
                                try {
                                    return mcpHealthMonitor.checkHealth(config).get();
                                } catch (Exception e) {
                                    log.error("Failed to check health for config: {}", config.getId(), e);
                                    com.heartsphere.mentis.service.McpHealthMonitor.HealthStatus status = 
                                            new com.heartsphere.mentis.service.McpHealthMonitor.HealthStatus();
                                    status.setConfigId(config.getId());
                                    status.setConfigName(config.getName());
                                    status.setStatus("ERROR");
                                    status.setHealthy(false);
                                    status.setMessage("健康检查失败");
                                    status.setError(e.getMessage());
                                    return status;
                                }
                            })
                            .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(createSuccessResponse(statuses));
        } catch (Exception e) {
            log.error("Failed to get all health status", e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 手动触发所有服务的健康检查
     */
    @PostMapping("/configs/health/check-all")
    public ResponseEntity<Map<String, Object>> checkAllHealth() {
        try {
            mcpHealthMonitor.checkAllEnabledServicesNow();
            Map<String, Object> result = new HashMap<>();
            result.put("message", "健康检查已触发");
            return ResponseEntity.ok(createSuccessResponse(result));
        } catch (Exception e) {
            log.error("Failed to trigger health check", e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 发现并注册所有 MCP 工具
     */
    @PostMapping("/tools/discover")
    public ResponseEntity<Map<String, Object>> discoverAndRegisterTools() {
        try {
            List<com.heartsphere.mentis.tool.Tool> tools = mcpToolDiscoveryService.discoverAndRegisterAllMcpTools();
            Map<String, Object> result = new HashMap<>();
            result.put("discoveredCount", tools.size());
            result.put("tools", tools.stream()
                    .map(t -> {
                        Map<String, Object> toolInfo = new HashMap<>();
                        toolInfo.put("name", t.getName());
                        toolInfo.put("description", t.getDescription());
                        return toolInfo;
                    })
                    .collect(java.util.stream.Collectors.toList()));
            return ResponseEntity.ok(createSuccessResponse(result));
        } catch (Exception e) {
            log.error("Failed to discover and register tools", e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 为特定配置发现并注册工具
     */
    @PostMapping("/configs/{id}/tools/discover")
    public ResponseEntity<Map<String, Object>> discoverToolsForConfig(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            List<com.heartsphere.mentis.tool.Tool> tools = mcpToolDiscoveryService.discoverAndRegisterToolsForConfig(config);
            Map<String, Object> result = new HashMap<>();
            result.put("discoveredCount", tools.size());
            result.put("tools", tools.stream()
                    .map(t -> {
                        Map<String, Object> toolInfo = new HashMap<>();
                        toolInfo.put("name", t.getName());
                        toolInfo.put("description", t.getDescription());
                        return toolInfo;
                    })
                    .collect(java.util.stream.Collectors.toList()));
            return ResponseEntity.ok(createSuccessResponse(result));
        } catch (Exception e) {
            log.error("Failed to discover tools for config: {}", id, e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 获取工具元数据
     */
    @GetMapping("/tools/metadata")
    public ResponseEntity<Map<String, Object>> getAllToolMetadata() {
        try {
            List<com.heartsphere.mentis.service.McpToolDiscoveryService.ToolMetadata> metadata = 
                    mcpToolDiscoveryService.getAllToolMetadata();
            return ResponseEntity.ok(createSuccessResponse(metadata));
        } catch (Exception e) {
            log.error("Failed to get tool metadata", e);
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 根据配置ID获取工具元数据
     */
    @GetMapping("/configs/{id}/tools/metadata")
    public ResponseEntity<Map<String, Object>> getToolMetadataByConfig(@PathVariable Long id) {
        try {
            List<com.heartsphere.mentis.service.McpToolDiscoveryService.ToolMetadata> metadata = 
                    mcpToolDiscoveryService.getToolMetadataByConfigId(id);
            return ResponseEntity.ok(createSuccessResponse(metadata));
        } catch (Exception e) {
            log.error("Failed to get tool metadata for config: {}", id, e);
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
