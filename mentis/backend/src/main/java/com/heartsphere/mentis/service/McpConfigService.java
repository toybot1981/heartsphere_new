package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.McpServerConfig;

import java.util.List;

/**
 * MCP 服务器配置管理服务接口
 */
public interface McpConfigService {

    /**
     * 创建 MCP 服务器配置
     */
    McpServerConfig createConfig(McpServerConfig config);

    /**
     * 更新 MCP 服务器配置
     */
    McpServerConfig updateConfig(Long id, McpServerConfig config);

    /**
     * 删除 MCP 服务器配置
     */
    void deleteConfig(Long id);

    /**
     * 获取配置
     */
    McpServerConfig getConfig(Long id);

    /**
     * 获取所有配置
     */
    List<McpServerConfig> getAllConfigs();

    /**
     * 获取用户的所有配置
     */
    List<McpServerConfig> getUserConfigs(Long userId);

    /**
     * 获取所有启用的配置
     */
    List<McpServerConfig> getEnabledConfigs();

    /**
     * 启用/禁用配置
     */
    McpServerConfig toggleConfig(Long id, Boolean enabled);

    /**
     * 测试 MCP 服务器连接
     */
    boolean testConnection(Long id);
    
    /**
     * 从模板创建配置
     */
    com.heartsphere.mentis.entity.McpServerConfig createConfigFromTemplate(Long templateId, java.util.Map<String, String> parameters);
}
