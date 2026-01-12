package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.McpServerConfig;
import com.heartsphere.mentis.repository.McpServerConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MCP 服务器配置管理服务实现
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class McpConfigServiceImpl implements McpConfigService {

    private final McpServerConfigRepository repository;
    private final McpClientService mcpClientService;

    @Override
    @Transactional
    public McpServerConfig createConfig(McpServerConfig config) {
        log.info("Creating MCP server config: {}", config.getName());
        return repository.save(config);
    }

    @Override
    @Transactional
    public McpServerConfig updateConfig(Long id, McpServerConfig config) {
        log.info("Updating MCP server config: {}", id);
        McpServerConfig existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
        
        existing.setName(config.getName());
        existing.setServerType(config.getServerType());
        existing.setServerUrl(config.getServerUrl());
        existing.setApiKey(config.getApiKey());
        existing.setEnabled(config.getEnabled());
        existing.setDescription(config.getDescription());
        existing.setExtraConfig(config.getExtraConfig());
        
        return repository.save(existing);
    }

    @Override
    @Transactional
    public void deleteConfig(Long id) {
        log.info("Deleting MCP server config: {}", id);
        repository.deleteById(id);
    }

    @Override
    public McpServerConfig getConfig(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCP config not found: " + id));
    }

    @Override
    public List<McpServerConfig> getAllConfigs() {
        return repository.findAll();
    }

    @Override
    public List<McpServerConfig> getUserConfigs(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<McpServerConfig> getEnabledConfigs() {
        return repository.findByEnabledTrue();
    }

    @Override
    @Transactional
    public McpServerConfig toggleConfig(Long id, Boolean enabled) {
        McpServerConfig config = getConfig(id);
        config.setEnabled(enabled);
        return repository.save(config);
    }

    @Override
    @Transactional
    public boolean testConnection(Long id) {
        McpServerConfig config = getConfig(id);
        try {
            boolean connected = mcpClientService.testConnection(config);
            config.setConnectionStatus(connected ? "CONNECTED" : "DISCONNECTED");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(null);
            repository.save(config);
            return connected;
        } catch (Exception e) {
            log.error("Failed to test MCP connection for config: {}", id, e);
            config.setConnectionStatus("ERROR");
            config.setLastTestedAt(LocalDateTime.now());
            config.setLastError(e.getMessage());
            repository.save(config);
            return false;
        }
    }
}
