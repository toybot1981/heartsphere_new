package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.AgentRoleDTO;
import com.heartsphere.admin.dto.MentisAgentConfigDTO;
import java.util.List;
import java.util.Map;

/**
 * Mentis Agent 管理服务接口
 */
public interface MentisAgentService {
    
    /**
     * 从 main 后端获取可用的 agent 角色列表
     */
    List<AgentRoleDTO> fetchAvailableAgents();
    
    /**
     * 获取已配置的 agent 列表
     */
    List<MentisAgentConfigDTO> getConfiguredAgents();
    
    /**
     * 配置 agent 用于 Mentis
     */
    MentisAgentConfigDTO configureAgentForMentis(Long agentId, Map<String, Object> configuration);
    
    /**
     * 移除 agent 配置
     */
    void removeAgentConfig(Long id);
    
    /**
     * 获取 agent 的能力详情
     */
    Map<String, Object> getAgentCapabilities(Long agentId);
    
    /**
     * 启用/禁用 agent 配置
     */
    void toggleAgentConfig(Long id, boolean enabled);
}
