package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.MentisMcpConfigDTO;
import java.util.List;
import java.util.Map;

/**
 * Mentis 管理服务接口
 */
public interface MentisManagementService {
    
    /**
     * 获取所有 MCP 配置
     */
    List<MentisMcpConfigDTO> getMcpConfigs();
    
    /**
     * 根据 ID 获取 MCP 配置
     */
    MentisMcpConfigDTO getMcpConfig(Long id);
    
    /**
     * 创建 MCP 配置
     */
    MentisMcpConfigDTO createMcpConfig(MentisMcpConfigDTO dto);
    
    /**
     * 更新 MCP 配置
     */
    MentisMcpConfigDTO updateMcpConfig(Long id, MentisMcpConfigDTO dto);
    
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
     * 调用 MCP 工具进行测试
     */
    Map<String, Object> callMcpTool(Long id, String toolName, Map<String, Object> arguments);
    
    /**
     * 切换 MCP 配置的启用/禁用状态
     */
    MentisMcpConfigDTO toggleMcpConfig(Long id, Boolean enabled);
    
    /**
     * 通知 Mentis 后端重新加载配置
     */
    void notifyMentisReload();
}
