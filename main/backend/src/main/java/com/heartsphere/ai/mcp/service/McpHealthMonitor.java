package com.heartsphere.ai.mcp.service;

import com.heartsphere.ai.mcp.entity.McpServerConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class McpHealthMonitor {

    private final McpConfigService mcpConfigService;
    private final McpClientService mcpClientService;

    @Async
    public CompletableFuture<HealthStatus> checkHealth(McpServerConfig config) {
        HealthStatus status = new HealthStatus();
        status.setConfigId(config.getId());
        status.setConfigName(config.getName());
        status.setCheckTime(LocalDateTime.now());
        try {
            boolean connected = mcpClientService.testConnection(config);
            if (connected) {
                status.setStatus("CONNECTED");
                status.setHealthy(true);
                status.setMessage("服务连接正常");
                config.setConnectionStatus("CONNECTED");
                config.setLastTestedAt(LocalDateTime.now());
                config.setLastError(null);
            } else {
                status.setStatus("DISCONNECTED");
                status.setHealthy(false);
                status.setMessage("服务连接失败");
                config.setConnectionStatus("DISCONNECTED");
                config.setLastTestedAt(LocalDateTime.now());
            }
            mcpConfigService.updateConfig(config.getId(), config);
        } catch (IllegalArgumentException e) {
            // URL 格式错误，记录更详细的错误信息
            log.error("checkHealth config {} failed: URL format invalid - {}", config.getId(), e.getMessage());
            String errorMsg = e.getMessage();
            status.setStatus("ERROR");
            status.setHealthy(false);
            status.setMessage("配置错误: " + errorMsg);
            status.setError(errorMsg);
            config.setConnectionStatus("ERROR");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(errorMsg);
            try {
                mcpConfigService.updateConfig(config.getId(), config);
            } catch (Exception updateEx) {
                log.error("Failed to update config error status", updateEx);
            }
        } catch (Exception e) {
            log.error("checkHealth config {} failed", config.getId(), e);
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            status.setStatus("ERROR");
            status.setHealthy(false);
            status.setMessage("健康检查失败: " + errorMsg);
            status.setError(errorMsg);
            config.setConnectionStatus("ERROR");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(errorMsg);
            try {
                mcpConfigService.updateConfig(config.getId(), config);
            } catch (Exception updateEx) {
                log.error("Failed to update config error status", updateEx);
            }
        }
        return CompletableFuture.completedFuture(status);
    }

    @Scheduled(fixedRate = 300000)
    public void checkAllEnabledServices() {
        try {
            List<McpServerConfig> configs = mcpConfigService.getEnabledConfigs();
            for (McpServerConfig c : configs) checkHealth(c);
        } catch (Exception e) {
            log.error("scheduled MCP health check failed", e);
        }
    }

    public void checkAllEnabledServicesNow() {
        checkAllEnabledServices();
    }

    @lombok.Data
    public static class HealthStatus {
        private Long configId;
        private String configName;
        private String status;
        private boolean healthy;
        private String message;
        private String error;
        private LocalDateTime checkTime;
    }
}
