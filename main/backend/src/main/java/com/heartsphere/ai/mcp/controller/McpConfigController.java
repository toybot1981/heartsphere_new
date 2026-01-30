package com.heartsphere.ai.mcp.controller;

import com.heartsphere.ai.mcp.entity.McpServerConfig;
import com.heartsphere.ai.mcp.service.McpClientService;
import com.heartsphere.ai.mcp.service.McpConfigService;
import com.heartsphere.ai.mcp.service.McpHealthMonitor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP 配置与工具 REST API（main 项目 ai/mcp）
 * 路径：/api/v1/ai/mcp，供 admin、内部服务调用。
 */
@RestController
@RequestMapping("/api/v1/ai/mcp")
@RequiredArgsConstructor
@Slf4j
public class McpConfigController {

    private final McpConfigService mcpConfigService;
    private final McpClientService mcpClientService;
    private final McpHealthMonitor mcpHealthMonitor;

    @PostMapping(value = "/configs", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createConfig(@RequestBody McpServerConfig config) {
        try {
            McpServerConfig created = mcpConfigService.createConfig(config);
            return ResponseEntity.ok(ok("success", created));
        } catch (Exception e) {
            log.error("Failed to create MCP config", e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PutMapping(value = "/configs/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateConfig(@PathVariable Long id, @RequestBody McpServerConfig config) {
        try {
            McpServerConfig updated = mcpConfigService.updateConfig(id, config);
            return ResponseEntity.ok(ok("success", updated));
        } catch (Exception e) {
            log.error("Failed to update MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @DeleteMapping(value = "/configs/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteConfig(@PathVariable Long id) {
        try {
            mcpConfigService.deleteConfig(id);
            return ResponseEntity.ok(ok("success", null));
        } catch (Exception e) {
            log.error("Failed to delete MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @GetMapping(value = "/configs/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getConfig(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            return ResponseEntity.ok(ok("success", config));
        } catch (Exception e) {
            log.error("Failed to get MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @GetMapping(value = "/configs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllConfigs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Boolean enabled) {
        try {
            List<McpServerConfig> configs;
            if (userId != null) {
                configs = mcpConfigService.getUserConfigs(userId);
            } else if (Boolean.TRUE.equals(enabled)) {
                configs = mcpConfigService.getEnabledConfigs();
            } else {
                configs = mcpConfigService.getAllConfigs();
            }
            return ResponseEntity.ok(ok("success", configs));
        } catch (Exception e) {
            log.error("Failed to get MCP configs", e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PatchMapping(value = "/configs/{id}/toggle", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> toggleConfig(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            Boolean enabled = body != null ? body.get("enabled") : null;
            McpServerConfig config = mcpConfigService.toggleConfig(id, enabled);
            return ResponseEntity.ok(ok("success", config));
        } catch (Exception e) {
            log.error("Failed to toggle MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PostMapping(value = "/configs/{id}/test", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable Long id) {
        try {
            boolean connected = mcpConfigService.testConnection(id);
            Map<String, Object> result = new HashMap<>();
            result.put("connected", connected);
            result.put("message", connected ? "连接成功" : "连接失败");
            return ResponseEntity.ok(ok("success", result));
        } catch (Exception e) {
            log.error("Failed to test MCP connection: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @GetMapping(value = "/configs/{id}/tools", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> listTools(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            List<Map<String, Object>> tools = mcpClientService.listTools(config);
            return ResponseEntity.ok(ok("success", tools));
        } catch (Exception e) {
            log.error("Failed to list tools for MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PostMapping(value = "/configs/{id}/tools/{toolName}/call", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> callTool(
            @PathVariable Long id,
            @PathVariable String toolName,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            @SuppressWarnings("unchecked")
            Map<String, Object> arguments = body != null && body.containsKey("arguments")
                    ? (Map<String, Object>) body.get("arguments") : null;
            Map<String, Object> result = mcpClientService.callTool(config, toolName, arguments);
            return ResponseEntity.ok(ok("success", result));
        } catch (Exception e) {
            log.error("Failed to call tool {} for MCP config: {}", toolName, id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PostMapping(value = "/configs/from-template/{templateId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createConfigFromTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, String> parameters) {
        try {
            McpServerConfig config = mcpConfigService.createConfigFromTemplate(templateId, parameters);
            return ResponseEntity.ok(ok("success", config));
        } catch (Exception e) {
            log.error("Failed to create config from template: {}", templateId, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PostMapping(value = "/configs/{id}/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> checkHealth(@PathVariable Long id) {
        try {
            McpServerConfig config = mcpConfigService.getConfig(id);
            McpHealthMonitor.HealthStatus status = mcpHealthMonitor.checkHealth(config).get();
            return ResponseEntity.ok(ok("success", status));
        } catch (Exception e) {
            log.error("Failed to check health for MCP config: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @GetMapping(value = "/configs/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllHealthStatus() {
        try {
            List<McpServerConfig> configs = mcpConfigService.getEnabledConfigs();
            List<McpHealthMonitor.HealthStatus> statuses = configs.stream()
                    .map(config -> {
                        try {
                            return mcpHealthMonitor.checkHealth(config).get();
                        } catch (Exception e) {
                            log.error("Failed to check health for config: {}", config.getId(), e);
                            McpHealthMonitor.HealthStatus s = new McpHealthMonitor.HealthStatus();
                            s.setConfigId(config.getId());
                            s.setConfigName(config.getName());
                            s.setStatus("ERROR");
                            s.setHealthy(false);
                            s.setMessage("健康检查失败");
                            s.setError(e.getMessage());
                            return s;
                        }
                    })
                    .toList();
            return ResponseEntity.ok(ok("success", statuses));
        } catch (Exception e) {
            log.error("Failed to get all health status", e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @PostMapping(value = "/configs/health/check-all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> checkAllHealth() {
        try {
            mcpHealthMonitor.checkAllEnabledServicesNow();
            return ResponseEntity.ok(ok("success", Map.of("message", "健康检查已触发")));
        } catch (Exception e) {
            log.error("Failed to trigger health check", e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @GetMapping(value = "/configs/validate-urls", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> validateAllUrls() {
        try {
            List<McpServerConfig> allConfigs = mcpConfigService.getAllConfigs();
            List<Map<String, Object>> invalidConfigs = new java.util.ArrayList<>();
            
            for (McpServerConfig config : allConfigs) {
                String serverUrl = config.getServerUrl();
                if (serverUrl == null || serverUrl.trim().isEmpty() ||
                    (!serverUrl.trim().startsWith("http://") && !serverUrl.trim().startsWith("https://"))) {
                    Map<String, Object> invalid = new HashMap<>();
                    invalid.put("id", config.getId());
                    invalid.put("name", config.getName());
                    invalid.put("serverType", config.getServerType());
                    invalid.put("serverUrl", serverUrl);
                    invalid.put("enabled", config.getEnabled());
                    invalid.put("error", com.heartsphere.ai.mcp.util.McpUrlValidator.getValidationError(serverUrl));
                    invalidConfigs.add(invalid);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("total", allConfigs.size());
            result.put("invalidCount", invalidConfigs.size());
            result.put("invalidConfigs", invalidConfigs);
            result.put("allValid", invalidConfigs.isEmpty());
            
            return ResponseEntity.ok(ok("success", result));
        } catch (Exception e) {
            log.error("Failed to validate URLs", e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    private static Map<String, Object> ok(String message, Object data) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", 200);
        m.put("message", message);
        m.put("data", data);
        return m;
    }

    private static Map<String, Object> err(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", 500);
        m.put("message", message);
        m.put("data", null);
        return m;
    }
}
