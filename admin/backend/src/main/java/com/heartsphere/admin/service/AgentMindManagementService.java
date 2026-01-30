package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.agentmind.AgentIdentityDTO;
import com.heartsphere.admin.dto.agentmind.AgentStateHistoryDTO;
import com.heartsphere.admin.dto.agentmind.AgentStateStatisticsDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Agent Mind 管理服务接口
 */
public interface AgentMindManagementService {
    
    // ========== 身份认知管理 ==========
    
    /**
     * 获取所有智能体身份认知列表（支持分页和搜索）
     */
    Page<AgentIdentityDTO> getAgentIdentities(Pageable pageable, String searchKeyword);
    
    /**
     * 根据角色ID获取智能体身份认知信息
     */
    AgentIdentityDTO getAgentIdentity(Long characterId);
    
    /**
     * 更新智能体身份认知信息
     */
    AgentIdentityDTO updateAgentIdentity(Long characterId, AgentIdentityDTO dto);
    
    /**
     * 初始化智能体身份认知（从Character信息构建）
     */
    AgentIdentityDTO initializeAgentIdentity(Long characterId);
    
    // ========== 状态监控 ==========
    
    /**
     * 获取智能体当前状态
     */
    AgentStateHistoryDTO getCurrentState(Long characterId);
    
    /**
     * 获取智能体状态历史（支持分页）
     */
    Page<AgentStateHistoryDTO> getStateHistory(Long characterId, Pageable pageable);
    
    /**
     * 根据时间范围获取状态历史
     */
    List<AgentStateHistoryDTO> getStateHistoryByTimeRange(Long characterId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取智能体状态统计信息
     */
    AgentStateStatisticsDTO getStateStatistics(Long characterId);
    
    // ========== 能力管理 ==========
    
    /**
     * 获取智能体能力列表
     */
    List<Map<String, Object>> getCapabilities(Long characterId);
    
    /**
     * 更新智能体能力列表
     */
    AgentIdentityDTO updateCapabilities(Long characterId, List<Map<String, Object>> capabilities);
    
    /**
     * 获取智能体能力边界
     */
    List<Map<String, Object>> getLimitations(Long characterId);
    
    /**
     * 更新智能体能力边界
     */
    AgentIdentityDTO updateLimitations(Long characterId, List<Map<String, Object>> limitations);
}
