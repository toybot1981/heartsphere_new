package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.McpConfigDTO;
import java.util.List;

/**
 * Mentis 管理服务接口
 */
public interface MentisManagementService {
    
    /**
     * 获取所有 MCP 配置
     */
    List<McpConfigDTO> getMcpConfigs();
    
    /**
     * 根据 ID 获取 MCP 配置
     */
    McpConfigDTO getMcpConfig(Long id);
    
    /**
     * 创建 MCP 配置
     */
    McpConfigDTO createMcpConfig(McpConfigDTO dto);
    
    /**
     * 更新 MCP 配置
     */
    McpConfigDTO updateMcpConfig(Long id, McpConfigDTO dto);
    
    /**
     * 删除 MCP 配置
     */
    void deleteMcpConfig(Long id);
    
    /**
     * 测试 MCP 连接
     */
    boolean testMcpConnection(Long id);
    
    /**
     * 获取 MCP 服务器的可用工具
     */
    List<Object> getMcpTools(Long id);
    
    /**
     * 通知 Mentis 后端重新加载配置
     */
    void notifyMentisReload();
}
