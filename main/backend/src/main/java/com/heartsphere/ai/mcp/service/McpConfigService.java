package com.heartsphere.ai.mcp.service;

import com.heartsphere.ai.mcp.entity.McpServerConfig;

import java.util.List;
import java.util.Map;

public interface McpConfigService {

    McpServerConfig createConfig(McpServerConfig config);

    McpServerConfig updateConfig(Long id, McpServerConfig config);

    void deleteConfig(Long id);

    McpServerConfig getConfig(Long id);

    List<McpServerConfig> getAllConfigs();

    List<McpServerConfig> getUserConfigs(Long userId);

    List<McpServerConfig> getEnabledConfigs();

    McpServerConfig toggleConfig(Long id, Boolean enabled);

    boolean testConnection(Long id);

    McpServerConfig createConfigFromTemplate(Long templateId, Map<String, String> parameters);
}
